const crypto = require("crypto");
const { Readable } = require("stream");
const QRCode = require("qrcode");
const sharp = require("sharp");
const jsQR = require("jsqr");
const UrlDao = require("../DAo/url.dao");
const { buildShortUrl } = require("./shorturlhelper.service");
const { assertEligibleOwnedUrl } = require("./qr.service");
const { getCloudinary } = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const { reserveQrGeneration, completeQrGeneration, releaseQrGeneration } = require("./qrQuota.service");

const SIZE = 800;
const QR_SIZE = 380;
const LOCK_MS = 30_000;
const styles = {
    minimal: "minimal clean geometric background",
    geometric: "bold geometric shapes and precise lines",
    nature: "calm botanical texture with subtle leaves",
    abstract: "modern abstract paint and soft shapes",
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 50));
const normalizeOptions = (options) => ({
    ...options,
    prompt: options.prompt.trim(),
    foregroundColor: options.foregroundColor.toUpperCase(),
    backgroundColor: options.backgroundColor.toUpperCase(),
});
const publicIdFor = (id, options) => `shortly/styled-qr/${id}/${crypto.createHash("sha256").update(JSON.stringify(options)).digest("hex").slice(0, 12)}`;

const sameStyle = (qrCode, shortUrl, options) => qrCode
    && qrCode.shortUrl === shortUrl
    && qrCode.style === options.style
    && qrCode.prompt === options.prompt
    && qrCode.foregroundColor === options.foregroundColor
    && qrCode.backgroundColor === options.backgroundColor
    && qrCode.url?.startsWith("https://");

const getArtwork = async (options) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const model = process.env.CLOUDFLARE_AI_MODEL || "@cf/black-forest-labs/flux-1-schnell";
    if (!accountId || !token) throw new ApiError(503, "AI artwork service is unavailable");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
        const direction = options.prompt
            ? `Treat this user direction as the primary creative brief: ${options.prompt}.`
            : "Choose original motifs appropriate to the selected style; do not use celebration imagery unless requested.";
        const prompt = `Square decorative artwork in a ${styles[options.style]} style. ${direction} Keep the center calm and suitable for a QR overlay. Decorative artwork only: no text, no QR code, no grid pattern.`;
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, steps: 4 }),
            signal: controller.signal,
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || !body?.success || !body?.result?.image) {
            throw new ApiError(503, response.status === 429 ? "AI artwork service is busy, please try again" : "AI artwork service is unavailable");
        }
        const artwork = Buffer.from(body.result.image, "base64");
        if (!artwork.length || artwork.length > 12 * 1024 * 1024) throw new ApiError(503, "AI artwork service returned an invalid image");
        return artwork;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(503, "AI artwork service is unavailable");
    } finally {
        clearTimeout(timeout);
    }
};

// Use the complete artwork and only soften the center. This keeps the design
// cohesive while giving the transparent quiet zone enough contrast to scan.
const composeQr = async (artwork, shortUrl, options, forceReadable = false) => {
    const colors = forceReadable
        ? { foregroundColor: "#111827", backgroundColor: "#FFFFFF" }
        : options;
    const qr = await QRCode.toBuffer(shortUrl, {
        type: "png", width: QR_SIZE, margin: 4,
        errorCorrectionLevel: "M",
        // Transparent light modules let the clean canvas show through. The
        // QR modules themselves stay fully opaque and sharp.
        color: { dark: colors.foregroundColor, light: "#00000000" },
    });
    const base = artwork
        ? sharp(artwork).resize(SIZE, SIZE, { fit: "cover", position: "centre" })
        : sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: colors.backgroundColor } });
    const opacity = forceReadable ? "0.98" : "0.78";
    const center = Buffer.from(`<svg width="${SIZE}" height="${SIZE}">
        <defs><radialGradient id="quiet" cx="50%" cy="50%" r="40%">
          <stop offset="0%" stop-color="${colors.backgroundColor}" stop-opacity="${opacity}"/>
          <stop offset="72%" stop-color="${colors.backgroundColor}" stop-opacity="${opacity}"/>
          <stop offset="100%" stop-color="${colors.backgroundColor}" stop-opacity="0"/>
        </radialGradient></defs>
        <circle cx="400" cy="400" r="300" fill="url(#quiet)"/>
      </svg>`);
    return base.composite([
        { input: center },
        { input: qr, left: 210, top: 210 },
    ]).png().toBuffer();
};

const verifyQr = async (image, shortUrl) => {
    const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    return decoded?.data === shortUrl;
};

const uploadPng = (buffer, publicId) => new Promise((resolve, reject) => {
    const upload = getCloudinary().uploader.upload_stream(
        { public_id: publicId, resource_type: "image", format: "png", secure: true, overwrite: true, invalidate: true },
        (error, result) => error ? reject(error) : resolve(result)
    );
    Readable.from(buffer).pipe(upload);
});

const destroy = (publicId) => getCloudinary().uploader.destroy(publicId, { resource_type: "image", invalidate: true });

const responseData = (url, shortUrl) => ({
    urlId: String(url._id), shortUrl,
    qrCode: { url: url.styledQrCode.url, publicId: url.styledQrCode.publicId, format: url.styledQrCode.format, style: url.styledQrCode.style },
});

const savedVariants = (url, shortUrl) => {
    const variants = url.styledQrCodes || [];
    // Existing QR-02 styled records remain discoverable after this upgrade.
    if (variants.length === 0 && url.styledQrCode?.shortUrl === shortUrl) return [url.styledQrCode];
    return variants;
};

const getOrCreateStyledQrCode = async (urlId, userId, input) => {
    const options = normalizeOptions(input);
    let url = await UrlDao.getUrlById(urlId);
    assertEligibleOwnedUrl(url, userId, new Date());
    const shortUrl = buildShortUrl(url.shortUrl);
    const cached = savedVariants(url, shortUrl).find((variant) => sameStyle(variant, shortUrl, options));
    if (cached) return { created: false, data: responseData({ ...url.toObject(), styledQrCode: cached }, shortUrl) };

    const token = crypto.randomUUID();
    const locked = await UrlDao.acquireStyledQrCodeGeneration(url._id, userId, token, new Date(), new Date(Date.now() - LOCK_MS));
    if (!locked) {
        for (let attempt = 0; attempt < 20; attempt += 1) {
            await wait();
            url = await UrlDao.getUrlById(urlId);
            assertEligibleOwnedUrl(url, userId, new Date());
            const waitingCache = savedVariants(url, shortUrl).find((variant) => sameStyle(variant, shortUrl, options));
            if (waitingCache) return { created: false, data: responseData({ ...url.toObject(), styledQrCode: waitingCache }, shortUrl) };
        }
        throw new ApiError(503, "Styled QR generation is temporarily unavailable");
    }

    const assetId = publicIdFor(url._id, options);
    let uploaded = false;
    let quotaReservation;
    try {
        // Matching saved variants return above, so only a new variant reserves quota.
        quotaReservation = await reserveQrGeneration(userId);
        const artwork = await getArtwork(options);
        let image = await composeQr(artwork, shortUrl, options);
        // Keep the same artwork on retry; only strengthen its local quiet area.
        if (!await verifyQr(image, shortUrl)) image = await composeQr(artwork, shortUrl, options, true);
        if (!await verifyQr(image, shortUrl)) throw new ApiError(503, "Unable to create a scannable QR code");

        const asset = await uploadPng(image, assetId);
        uploaded = true;
        if (!asset?.secure_url?.startsWith("https://")) throw new Error("Cloudinary did not return a secure URL");
        const styledQrCode = { publicId: asset.public_id || assetId, url: asset.secure_url, format: asset.format || "png", shortUrl, ...options, generatedAt: new Date() };
        const updated = await UrlDao.saveStyledQrCode(url._id, userId, token, styledQrCode);
        if (!updated) throw new Error("Styled QR generation lock was lost");
        await completeQrGeneration(userId, quotaReservation);
        quotaReservation = null;
        return { created: true, data: responseData(updated, shortUrl) };
    } catch (error) {
        if (uploaded && await UrlDao.hasStyledQrCodeLock(url._id, userId, token).catch(() => false)) {
            try { await destroy(assetId); } catch (cleanupError) { console.error("Styled QR cleanup failed", cleanupError); }
        }
        await UrlDao.releaseStyledQrCodeGeneration(url._id, userId, token).catch((releaseError) => console.error("Styled QR lock release failed", releaseError));
        await releaseQrGeneration(userId, quotaReservation).catch((releaseError) => console.error("Styled QR quota release failed", releaseError));
        if (error instanceof ApiError) throw error;
        console.error("Styled QR generation failed", error);
        throw new ApiError(503, "Styled QR service is unavailable");
    }
};

const getStyledQrCodes = async (urlId, userId) => {
    const url = await UrlDao.getUrlById(urlId);
    assertEligibleOwnedUrl(url, userId, new Date());
    const shortUrl = buildShortUrl(url.shortUrl);
    return { shortUrl, qrCodes: savedVariants(url, shortUrl).map((qrCode) => ({
        url: qrCode.url, publicId: qrCode.publicId, format: qrCode.format,
        style: qrCode.style, prompt: qrCode.prompt,
        foregroundColor: qrCode.foregroundColor, backgroundColor: qrCode.backgroundColor,
        generatedAt: qrCode.generatedAt,
    })) };
};

module.exports = { getOrCreateStyledQrCode, getStyledQrCodes, composeQr, verifyQr, getArtwork };
