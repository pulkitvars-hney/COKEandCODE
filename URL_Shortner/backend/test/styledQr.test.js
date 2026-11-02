jest.mock("../src/config/cloudinary", () => ({ getCloudinary: jest.fn() }));

jest.setTimeout(30_000);

const { Writable } = require("stream");
const request = require("supertest");
const sharp = require("sharp");
const QRCode = require("qrcode");
const app = require("../src/app");
const Url = require("../src/models/url.models");
const UrlDao = require("../src/DAo/url.dao");
const { getCloudinary } = require("../src/config/cloudinary");
const { composeQr, verifyQr } = require("../src/services/styledQr.service");

const user = { username: "styled_qr_user", email: "styled-qr@example.com", password: "Password@123" };
const cookieValue = (response) => response.headers["set-cookie"].find((value) => value.startsWith("accessToken=")).split(";")[0];
const login = async (data = user) => {
    await request(app).post("/api/auth/signup").send(data);
    return cookieValue(await request(app).post("/api/auth/login").send({ email: data.email, password: data.password }));
};
const createUrl = async (cookie, alias = "styled-qr-link") => {
    await request(app).post("/api/url/create").set("Cookie", cookie).send({ originalUrl: "https://example.com/styled", alias });
    return Url.findOne({ shortUrl: alias });
};

describe("styled QR API", () => {
    let cloudinary;
    let upload;

    beforeEach(async () => {
        process.env.CLOUDFLARE_ACCOUNT_ID = "account";
        process.env.CLOUDFLARE_API_TOKEN = "token";
        const artwork = await sharp({ create: { width: 48, height: 48, channels: 3, background: "#7294c4" } }).jpeg().toBuffer();
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, result: { image: artwork.toString("base64") } }) });
        upload = jest.fn((options, callback) => {
            const stream = new Writable({ write(_chunk, _encoding, done) { done(); } });
            stream.on("finish", () => callback(null, { public_id: options.public_id, secure_url: `https://res.cloudinary.com/test/${options.public_id}.png`, format: "png" }));
            return stream;
        });
        cloudinary = { uploader: { upload_stream: upload, destroy: jest.fn().mockResolvedValue({ result: "ok" }) } };
        getCloudinary.mockReturnValue(cloudinary);
    });

    afterEach(() => { jest.restoreAllMocks(); getCloudinary.mockReset(); });

    test("composes and decodes a real QR PNG", async () => {
        const shortUrl = "http://localhost:3000/api/scannable";
        const image = await composeQr(null, shortUrl, { foregroundColor: "#111827", backgroundColor: "#FFFFFF" });
        expect(await verifyQr(image, shortUrl)).toBe(true);
    }, 20_000);

    test("keeps a transparent QR scannable over perimeter artwork", async () => {
        const shortUrl = "http://localhost:3000/api/perimeter";
        const artwork = await sharp({ create: { width: 80, height: 80, channels: 3, background: "#f97316" } }).png().toBuffer();
        const image = await composeQr(artwork, shortUrl, { foregroundColor: "#111827", backgroundColor: "#FFFFFF" });
        expect(await verifyQr(image, shortUrl)).toBe(true);
    }, 20_000);

    test("keeps QR light modules transparent", async () => {
        const qr = await QRCode.toBuffer("http://localhost:3000/api/alpha", { type: "png", width: 200, margin: 4, color: { dark: "#111827", light: "#00000000" } });
        const { data } = await sharp(qr).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        expect(data.some((_value, index) => index % 4 === 3 && data[index] === 0)).toBe(true);
    });

    test("generates and persists a styled QR for the owner", async () => {
        const cookie = await login();
        const url = await createUrl(cookie);
        const response = await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie).send({ style: "geometric", prompt: "silver lines", foregroundColor: "#111827", backgroundColor: "#FFFFFF" });
        expect(response.statusCode).toBe(201);
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/ai/run/@cf/black-forest-labs/flux-1-schnell"), expect.objectContaining({ method: "POST" }));
        expect(upload).toHaveBeenCalledTimes(1);
        expect((await Url.findById(url._id)).styledQrCode).toEqual(expect.objectContaining({ style: "geometric", shortUrl: `http://localhost:3000/api/${url.shortUrl}` }));
    });

    test("requires auth, ownership, and a valid body", async () => {
        const cookie = await login();
        const url = await createUrl(cookie);
        expect((await request(app).post(`/api/url/${url._id}/qr/styled`).send({})).statusCode).toBe(401);
        expect((await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie).send({ style: "nope" })).statusCode).toBe(400);
        const other = await login({ username: "styled_other", email: "styled-other@example.com", password: "Password@123" });
        expect((await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", other).send({})).statusCode).toBe(403);
    });

    test("returns a clear error for Cloudflare rate limits without uploading", async () => {
        const cookie = await login();
        const url = await createUrl(cookie);
        global.fetch.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ success: false }) });
        const response = await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie).send({});
        expect(response.statusCode).toBe(503);
        expect(response.body.message).toBe("AI artwork service is busy, please try again");
        expect(upload).not.toHaveBeenCalled();
    });

    test("reuses a matching stored style and cleans up after persistence failure", async () => {
        const cookie = await login();
        const url = await createUrl(cookie);
        const first = await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie).send({});
        const second = await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie).send({});
        expect(first.statusCode).toBe(201);
        expect(second.statusCode).toBe(200);
        expect(upload).toHaveBeenCalledTimes(1);

        const nextUrl = await createUrl(cookie, "styled-save-fails");
        jest.spyOn(UrlDao, "saveStyledQrCode").mockRejectedValueOnce(new Error("database unavailable"));
        const failed = await request(app).post(`/api/url/${nextUrl._id}/qr/styled`).set("Cookie", cookie).send({});
        expect(failed.statusCode).toBe(503);
        expect(cloudinary.uploader.destroy).toHaveBeenCalled();
        expect((await Url.findById(nextUrl._id)).styledQrCode).toBeNull();
    });

    test("keeps independent variants and lists them without generating again", async () => {
        const cookie = await login();
        const url = await createUrl(cookie, "styled-variants");
        const first = { style: "minimal", prompt: "party balloons", foregroundColor: "#111827", backgroundColor: "#FFFFFF" };
        const second = { ...first, style: "geometric" };
        expect((await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie).send(first)).statusCode).toBe(201);
        expect((await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie).send(first)).statusCode).toBe(200);
        expect((await request(app).post(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie).send(second)).statusCode).toBe(201);
        const stored = await request(app).get(`/api/url/${url._id}/qr/styled`).set("Cookie", cookie);
        expect(stored.statusCode).toBe(200);
        expect(stored.body.data.qrCodes).toHaveLength(2);
        expect(upload).toHaveBeenCalledTimes(2);
    });
});
