const { Readable } = require("stream");
const crypto = require("crypto");
const QRCode = require("qrcode");
const UrlDao = require("../DAo/url.dao");
const { buildShortUrl } = require("./shorturlhelper.service");
const { getCloudinary } = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const { reserveQrGeneration, completeQrGeneration, releaseQrGeneration } = require("./qrQuota.service");

const GENERATION_LOCK_MS = 30_000;
const WAIT_ATTEMPTS = 20;
const WAIT_MS = 25;

const wait = () => new Promise((resolve) => setTimeout(resolve, WAIT_MS));

const publicIdFor = (urlId) => `shortly/qr/${urlId}`;

const isValidQrCode = (url, canonicalShortUrl) => {
    const qrCode = url.qrCode;
    return Boolean(
        qrCode
        && qrCode.publicId === publicIdFor(url._id)
        && qrCode.url
        && qrCode.url.startsWith("https://")
        && qrCode.format === "png"
        && qrCode.shortUrl === canonicalShortUrl
    );
};

const assertEligibleOwnedUrl = (url, userId, now) => {
    if (!url) {
        throw new ApiError(404, "Url not found");
    }
    if (String(url.userId) !== String(userId)) {
        throw new ApiError(403, "Access forbidden");
    }
    // Redirects require an active URL with a future expiry; retain the same
    // null-expiry behavior here rather than inventing a second lifecycle rule.
    if (url.status !== "active" || !url.expiresAt || new Date(url.expiresAt) <= now) {
        throw new ApiError(409, "URL is not active");
    }
};

const uploadQrCode = (buffer, publicId) => new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
    const upload = cloudinary.uploader.upload_stream(
        {
            public_id: publicId,
            resource_type: "image",
            format: "png",
            secure: true,
            overwrite: true,
            invalidate: true,
        },
        (error, result) => error ? reject(error) : resolve(result)
    );
    Readable.from(buffer).pipe(upload);
});

const removeUploadedQrCode = async (urlId) => {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicIdFor(urlId), {
        resource_type: "image",
        invalidate: true,
    });
};

const responseData = (url, canonicalShortUrl) => ({
    urlId: String(url._id),
    shortUrl: canonicalShortUrl,
    qrCode: {
        url: url.qrCode.url,
        publicId: url.qrCode.publicId,
        format: url.qrCode.format,
    },
});

const getOrCreateQrCode = async (urlId, userId) => {
    let url = await UrlDao.getUrlById(urlId);
    const now = new Date();
    assertEligibleOwnedUrl(url, userId, now);
    const canonicalShortUrl = buildShortUrl(url.shortUrl);

    if (isValidQrCode(url, canonicalShortUrl)) {
        return { created: false, data: responseData(url, canonicalShortUrl) };
    }

    const token = crypto.randomUUID();
    const locked = await UrlDao.acquireQrCodeGeneration(
        url._id,
        userId,
        token,
        now,
        new Date(now.getTime() - GENERATION_LOCK_MS)
    );

    if (!locked) {
        for (let attempt = 0; attempt < WAIT_ATTEMPTS; attempt += 1) {
            await wait();
            url = await UrlDao.getUrlById(urlId);
            assertEligibleOwnedUrl(url, userId, new Date());
            if (isValidQrCode(url, canonicalShortUrl)) {
                return { created: false, data: responseData(url, canonicalShortUrl) };
            }
        }
        throw new ApiError(503, "QR code service is temporarily unavailable");
    }

    let uploaded = false;
    let quotaReservation;
    try {
        // Cached QR codes return above. Reserve only a genuinely new asset.
        quotaReservation = await reserveQrGeneration(userId);
        const png = await QRCode.toBuffer(canonicalShortUrl, {
            type: "png",
            errorCorrectionLevel: "M",
            width: 512,
            margin: 2,
        });
        const uploadedAsset = await uploadQrCode(png, publicIdFor(url._id));
        uploaded = true;

        const qrCode = {
            publicId: uploadedAsset.public_id || publicIdFor(url._id),
            url: uploadedAsset.secure_url,
            format: uploadedAsset.format || "png",
            shortUrl: canonicalShortUrl,
            generatedAt: new Date(),
        };
        if (!qrCode.url || !qrCode.url.startsWith("https://")) {
            throw new Error("Cloudinary did not return a secure QR URL");
        }

        const updatedUrl = await UrlDao.saveQrCode(url._id, userId, token, qrCode);
        if (!updatedUrl) {
            throw new Error("QR code generation lock was lost");
        }
        await completeQrGeneration(userId, quotaReservation);
        quotaReservation = null;
        return { created: true, data: responseData(updatedUrl, canonicalShortUrl) };
    } catch (error) {
        // Only clean up while this request still owns the lock. That prevents a
        // failed request from deleting a deterministic asset another request has
        // already persisted after taking over an expired lock.
        if (uploaded) {
            try {
                const lockHeld = await UrlDao.isQrCodeGenerationLockHeld(url._id, userId, token);
                if (lockHeld) {
                    await removeUploadedQrCode(url._id);
                }
            } catch (cleanupError) {
                console.error("QR asset cleanup failed", cleanupError);
            }
        }
        try {
            await UrlDao.releaseQrCodeGeneration(url._id, userId, token);
        } catch (releaseError) {
            console.error("QR generation lock release failed", releaseError);
        }
        await releaseQrGeneration(userId, quotaReservation).catch((releaseError) => console.error("QR quota release failed", releaseError));

        if (error instanceof ApiError) {
            throw error;
        }
        console.error("QR code generation failed", error);
        throw new ApiError(503, "QR code service is unavailable");
    }
};

module.exports = { getOrCreateQrCode, isValidQrCode, publicIdFor, assertEligibleOwnedUrl };
