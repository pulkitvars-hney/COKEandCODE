jest.mock("../src/config/cloudinary", () => ({ getCloudinary: jest.fn() }));

const { Writable } = require("stream");
const request = require("supertest");
const QRCode = require("qrcode");
const app = require("../src/app");
const Url = require("../src/models/url.models");
const UrlDao = require("../src/DAo/url.dao");
const { getCloudinary } = require("../src/config/cloudinary");
const ApiError = require("../src/utils/ApiError");

const user = {
    username: "qr_test_user",
    email: "qr-test@example.com",
    password: "Password@123",
};

const getCookie = (response, name) => {
    const cookie = response.headers["set-cookie"]?.find((value) => value.startsWith(`${name}=`));
    return cookie?.split(";")[0].split("=")[1];
};

const createAuthCookie = async (userData = user) => {
    await request(app).post("/api/auth/signup").send(userData);
    const login = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: userData.password,
    });
    return `accessToken=${getCookie(login, "accessToken")}`;
};

const createUrl = async (cookie, alias = "qr-link") => {
    const response = await request(app)
        .post("/api/url/create")
        .set("Cookie", cookie)
        .send({ originalUrl: "https://example.com/qr-destination", alias });
    expect(response.statusCode).toBe(201);
    return Url.findOne({ shortUrl: alias });
};

describe("QR code API", () => {
    let cloudinary;
    let uploadStream;

    beforeEach(() => {
        process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
        process.env.CLOUDINARY_API_KEY = "test-key";
        process.env.CLOUDINARY_API_SECRET = "test-secret";

        uploadStream = jest.fn((options, callback) => {
            const stream = new Writable({
                write(_chunk, _encoding, done) { done(); },
            });
            stream.on("finish", () => callback(null, {
                public_id: options.public_id,
                secure_url: `https://res.cloudinary.com/test-cloud/image/upload/${options.public_id}.png`,
                format: "png",
            }));
            return stream;
        });
        cloudinary = {
            uploader: {
                upload_stream: uploadStream,
                destroy: jest.fn().mockResolvedValue({ result: "ok" }),
            },
        };
        getCloudinary.mockReturnValue(cloudinary);
        jest.spyOn(QRCode, "toBuffer").mockResolvedValue(Buffer.from("test-png"));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        getCloudinary.mockReset();
    });

    afterAll(() => {
        delete process.env.CLOUDINARY_CLOUD_NAME;
        delete process.env.CLOUDINARY_API_KEY;
        delete process.env.CLOUDINARY_API_SECRET;
    });

    test("rejects unauthenticated QR generation", async () => {
        const response = await request(app).post("/api/url/507f1f77bcf86cd799439011/qr");
        expect(response.statusCode).toBe(401);
    });

    test("rejects malformed URL IDs", async () => {
        const cookie = await createAuthCookie();
        const response = await request(app).post("/api/url/not-an-id/qr").set("Cookie", cookie);
        expect(response.statusCode).toBe(400);
    });

    test("returns 404 for a missing URL", async () => {
        const cookie = await createAuthCookie();
        const response = await request(app)
            .post("/api/url/507f1f77bcf86cd799439011/qr")
            .set("Cookie", cookie);
        expect(response.statusCode).toBe(404);
    });

    test("does not allow another user to generate a QR code", async () => {
        const ownerCookie = await createAuthCookie();
        const url = await createUrl(ownerCookie);
        const otherCookie = await createAuthCookie({
            username: "other_qr_user", email: "other-qr@example.com", password: "Password@123",
        });

        const response = await request(app).post(`/api/url/${url._id}/qr`).set("Cookie", otherCookie);
        expect(response.statusCode).toBe(403);
        expect(uploadStream).not.toHaveBeenCalled();
    });

    test.each([
        ["deleted", { status: "deleted" }],
        ["expired", { status: "expired" }],
        ["past expiry while status is active", { status: "active", expiresAt: new Date(Date.now() - 1_000) }],
    ])("rejects a %s URL", async (_label, update) => {
        const cookie = await createAuthCookie();
        const url = await createUrl(cookie);
        await Url.updateOne({ _id: url._id }, { $set: update });

        const response = await request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie);
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("URL is not active");
    });

    test("generates, uploads, and persists a canonical short-link QR code", async () => {
        const cookie = await createAuthCookie();
        const url = await createUrl(cookie);

        const response = await request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie);

        expect(response.statusCode).toBe(201);
        const canonicalShortUrl = `http://localhost:3000/api/${url.shortUrl}`;
        expect(QRCode.toBuffer).toHaveBeenCalledWith(canonicalShortUrl, expect.objectContaining({ type: "png" }));
        expect(QRCode.toBuffer).not.toHaveBeenCalledWith(url.originalUrl, expect.anything());
        expect(uploadStream).toHaveBeenCalledWith(expect.objectContaining({
            public_id: `shortly/qr/${url._id}`,
            resource_type: "image",
            format: "png",
            secure: true,
        }), expect.any(Function));
        expect(response.body.data).toEqual(expect.objectContaining({
            urlId: String(url._id),
            shortUrl: canonicalShortUrl,
            qrCode: expect.objectContaining({ publicId: `shortly/qr/${url._id}`, format: "png" }),
        }));
        const stored = await Url.findById(url._id);
        expect(stored.qrCode).toEqual(expect.objectContaining({
            publicId: `shortly/qr/${url._id}`,
            shortUrl: canonicalShortUrl,
            format: "png",
            generatedAt: expect.any(Date),
        }));
    });

    test("reuses valid persisted QR metadata without another upload", async () => {
        const cookie = await createAuthCookie();
        const url = await createUrl(cookie);
        const first = await request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie);
        const second = await request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie);

        expect(first.statusCode).toBe(201);
        expect(second.statusCode).toBe(200);
        expect(uploadStream).toHaveBeenCalledTimes(1);
    });

    test("returns a sanitized 503 when Cloudinary is unavailable", async () => {
        const cookie = await createAuthCookie();
        const url = await createUrl(cookie);
        getCloudinary.mockImplementation(() => { throw new ApiError(503, "QR code service is unavailable"); });

        const response = await request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie);
        expect(response.statusCode).toBe(503);
        expect(response.body).toEqual(expect.objectContaining({
            success: false,
            message: "QR code service is unavailable",
        }));
    });

    test("does not persist metadata when the upload fails", async () => {
        const cookie = await createAuthCookie();
        const url = await createUrl(cookie);
        uploadStream.mockImplementationOnce((_options, callback) => {
            const stream = new Writable({ write(_chunk, _encoding, done) { done(); } });
            stream.on("finish", () => callback(new Error("provider unavailable")));
            return stream;
        });

        const response = await request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie);
        expect(response.statusCode).toBe(503);
        expect((await Url.findById(url._id)).qrCode).toBeNull();
    });

    test("cleans up a newly uploaded asset when persistence fails while holding the lock", async () => {
        const cookie = await createAuthCookie();
        const url = await createUrl(cookie);
        jest.spyOn(UrlDao, "saveQrCode").mockRejectedValueOnce(new Error("database write failed"));

        const response = await request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie);
        expect(response.statusCode).toBe(503);
        expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(`shortly/qr/${url._id}`, expect.any(Object));
        expect((await Url.findById(url._id)).qrCode).toBeNull();
    });

    test("concurrent requests create one asset and return stable metadata", async () => {
        const cookie = await createAuthCookie();
        const url = await createUrl(cookie, "concurrent-qr");
        const [first, second] = await Promise.all([
            request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie),
            request(app).post(`/api/url/${url._id}/qr`).set("Cookie", cookie),
        ]);

        expect([first.statusCode, second.statusCode].sort()).toEqual([200, 201]);
        expect(uploadStream).toHaveBeenCalledTimes(1);
        expect((await Url.findById(url._id)).qrCode.publicId).toBe(`shortly/qr/${url._id}`);
    });
});
