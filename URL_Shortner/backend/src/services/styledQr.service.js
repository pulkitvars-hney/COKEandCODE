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

const SIZE = 800;
const PANEL_SIZE = 640;
const QR_SIZE = 560;
const LOCK_MS = 30_000;
const styles = {
    minimal: "minimal clean geometric background",
    geometric: "bold geometric shapes and precise lines",
    nature: "calm botanical texture with subtle leaves",
    abstract: "modern abstract paint and soft shapes",
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 50));
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
        const prompt = `${styles[options.style]}. ${options.prompt || ""}. Decorative QR code background only, no text, no QR code, no grid pattern.`;
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

// Artwork is only a frame. The separately generated QR panel keeps every
// module and its quiet zone unchanged, which makes scanning reliable.
const composeQr = async (artwork, shortUrl, options) => {
    const qr = await QRCode.toBuffer(shortUrl, {
        type: "png", width: QR_SIZE, margin: 4,
        errorCorrectionLevel: "M",
        color: { dark: options.foregroundColor, light: options.backgroundColor },
    });
    const background = artwork
        ? await sharp(artwork).resize(SIZE, SIZE, { fit: "cover" }).modulate({ brightness: 0.7 }).png().toBuffer()
        : await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: options.backgroundColor } }).png().toBuffer();
    const panel = Buffer.from(`<svg width="${PANEL_SIZE}" height="${PANEL_SIZE}"><rect width="100%" height="100%" rx="24" fill="${options.backgroundColor}"/></svg>`);
    return sharp(background).composite([
        { input: panel, top: 80, left: 80 },
        { input: qr, top: 120, left: 120 },
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

const getOrCreateStyledQrCode = async (urlId, userId, options) => {
    let url = await UrlDao.getUrlById(urlId);
    assertEligibleOwnedUrl(url, userId, new Date());
    const shortUrl = buildShortUrl(url.shortUrl);
    if (sameStyle(url.styledQrCode, shortUrl, options)) return { created: false, data: responseData(url, shortUrl) };

    const token = crypto.randomUUID();
    const locked = await UrlDao.acquireStyledQrCodeGeneration(url._id, userId, token, new Date(), new Date(Date.now() - LOCK_MS));
    if (!locked) {
        for (let attempt = 0; attempt < 20; attempt += 1) {
            await wait();
            url = await UrlDao.getUrlById(urlId);
            assertEligibleOwnedUrl(url, userId, new Date());
            if (sameStyle(url.styledQrCode, shortUrl, options)) return { created: false, data: responseData(url, shortUrl) };
        }
        throw new ApiError(503, "Styled QR generation is temporarily unavailable");
    }

    const assetId = publicIdFor(url._id, options);
    let uploaded = false;
    try {
        const artwork = await getArtwork(options);
        let image = await composeQr(artwork, shortUrl, options);
        // A plain background is the only fallback: it retains a verifiable QR
        // without asking AI to alter the code pattern.
        if (!await verifyQr(image, shortUrl)) image = await composeQr(null, shortUrl, options);
        if (!await verifyQr(image, shortUrl)) throw new ApiError(503, "Unable to create a scannable QR code");

        const asset = await uploadPng(image, assetId);
        uploaded = true;
        if (!asset?.secure_url?.startsWith("https://")) throw new Error("Cloudinary did not return a secure URL");
        const styledQrCode = { publicId: asset.public_id || assetId, url: asset.secure_url, format: asset.format || "png", shortUrl, ...options, generatedAt: new Date() };
        const previousId = url.styledQrCode?.publicId;
        const updated = await UrlDao.saveStyledQrCode(url._id, userId, token, styledQrCode);
        if (!updated) throw new Error("Styled QR generation lock was lost");
        if (previousId && previousId !== styledQrCode.publicId) destroy(previousId).catch((error) => console.error("Old styled QR cleanup failed", error));
        return { created: true, data: responseData(updated, shortUrl) };
    } catch (error) {
        if (uploaded && await UrlDao.hasStyledQrCodeLock(url._id, userId, token).catch(() => false)) {
            try { await destroy(assetId); } catch (cleanupError) { console.error("Styled QR cleanup failed", cleanupError); }
        }
        await UrlDao.releaseStyledQrCodeGeneration(url._id, userId, token).catch((releaseError) => console.error("Styled QR lock release failed", releaseError));
        if (error instanceof ApiError) throw error;
        console.error("Styled QR generation failed", error);
        throw new ApiError(503, "Styled QR service is unavailable");
    }
};

module.exports = { getOrCreateStyledQrCode, composeQr, verifyQr, getArtwork };
