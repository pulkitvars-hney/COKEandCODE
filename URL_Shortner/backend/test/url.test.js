const request = require("supertest");
const app = require("../src/app");
const Url = require("../src/models/url.models");
const Analytics = require("../src/models/analytic.model");

const user = {
    username: "url_test_user",
    email: "url-test@example.com",
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

describe("URL shortening API", () => {
    test("rejects URL creation without authentication", async () => {
        const response = await request(app)
            .post("/api/url/create")
            .send({ originalUrl: "https://example.com" });

        expect(response.statusCode).toBe(401);
    });

    test("creates a NanoID short URL when no alias is supplied", async () => {
        const cookie = await createAuthCookie();
        const response = await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com/article" });

        expect(response.statusCode).toBe(201);
        expect(response.body.shortUrl).toMatch(/\/api\/[A-Za-z0-9_-]{7}$/);
        expect(await Url.countDocuments()).toBe(1);
    });

    test("stores and redirects a generated short URL", async () => {
        const cookie = await createAuthCookie();
        const createResponse = await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com/generated" });
        const shortCode = createResponse.body.shortUrl.split("/").pop();
        const storedUrl = await Url.findOne({ shortUrl: shortCode });

        expect(storedUrl).not.toBeNull();
        expect(storedUrl.originalUrl).toBe("https://example.com/generated");

        const redirectResponse = await request(app).get(`/api/${shortCode}`);
        expect(redirectResponse.statusCode).toBe(302);
        expect(redirectResponse.headers.location).toBe("https://example.com/generated");
    });

    test("creates a short URL with a custom alias", async () => {
        const cookie = await createAuthCookie();
        const response = await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com/article", alias: "my-link" });

        expect(response.statusCode).toBe(201);
        expect(response.body.shortUrl).toMatch(/\/api\/my-link$/);
        expect(await Url.findOne({ shortUrl: "my-link" })).toEqual(expect.objectContaining({
            originalUrl: "https://example.com/article",
        }));
    });

    test.each([
        [{}, "originalUrl is required"],
        [{ originalUrl: "not-a-url" }, "invalid URL"],
        [{ originalUrl: "ftp://example.com" }, "unsupported protocol"],
        [{ originalUrl: "https://example.com", alias: "bad alias" }, "invalid alias"],
        [{ originalUrl: "https://example.com", alias: "ab" }, "short alias"],
    ])("rejects %s (%s)", async (body) => {
        const cookie = await createAuthCookie();
        const response = await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send(body);

        expect(response.statusCode).toBe(400);
    });

    test("rejects a reserved alias", async () => {
        const cookie = await createAuthCookie();
        const response = await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com", alias: "api" });

        expect(response.statusCode).toBe(400);
    });

    test("rejects a duplicate custom alias", async () => {
        const cookie = await createAuthCookie();
        const body = { originalUrl: "https://example.com/one", alias: "same-link" };
        await request(app).post("/api/url/create").set("Cookie", cookie).send(body);

        const response = await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com/two", alias: "same-link" });

        expect(response.statusCode).toBe(409);
    });

    test("reuses an existing generated URL for the same user and destination", async () => {
        const cookie = await createAuthCookie();
        const body = { originalUrl: "https://example.com/same" };
        const first = await request(app).post("/api/url/create").set("Cookie", cookie).send(body);
        const second = await request(app).post("/api/url/create").set("Cookie", cookie).send(body);

        expect(first.statusCode).toBe(201);
        expect(second.statusCode).toBe(201);
        expect(second.body.shortUrl).toBe(first.body.shortUrl);
        expect(await Url.countDocuments()).toBe(1);
    });

    test("lists the authenticated user's URLs", async () => {
        const cookie = await createAuthCookie();
        await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com/listed", alias: "listed-link" });

        const response = await request(app)
            .get("/api/url/myurls")
            .set("Cookie", cookie);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].shortCode).toBe("listed-link");
    });

    test("allows the owner to delete a URL", async () => {
        const cookie = await createAuthCookie();
        await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com/delete", alias: "delete-me" });
        const storedUrl = await Url.findOne({ shortUrl: "delete-me" });

        const response = await request(app)
            .delete(`/api/url/${storedUrl._id}`)
            .set("Cookie", cookie);

        expect(response.statusCode).toBe(200);
        expect(await Url.exists({ _id: storedUrl._id })).toBeNull();
    });

    test("redirects a custom alias to its original URL", async () => {
        const cookie = await createAuthCookie();
        await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com/redirect-target", alias: "redirect-me" });

        const response = await request(app).get("/api/redirect-me");

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe("https://example.com/redirect-target");
    });

    test("returns 404 for a nonexistent alias", async () => {
        const response = await request(app).get("/api/does-not-exist");
        expect(response.statusCode).toBe(404);
    });

    test("prevents another user from deleting an owned URL", async () => {
        const ownerCookie = await createAuthCookie();
        await request(app)
            .post("/api/url/create")
            .set("Cookie", ownerCookie)
            .send({ originalUrl: "https://example.com/private", alias: "private-link" });
        const storedUrl = await Url.findOne({ shortUrl: "private-link" });

        const otherUserCookie = await createAuthCookie({
            username: "another_url_user",
            email: "another-url@example.com",
            password: "Password@123",
        });
        const response = await request(app)
            .delete(`/api/url/${storedUrl._id}`)
            .set("Cookie", otherUserCookie);

        expect(response.statusCode).toBe(403);
    });

    test("records an analytics click when a short URL redirects", async () => {
        const cookie = await createAuthCookie();
        await request(app)
            .post("/api/url/create")
            .set("Cookie", cookie)
            .send({ originalUrl: "https://example.com/analytics", alias: "analytics-link" });

        const redirectResponse = await request(app).get("/api/analytics-link");
        const storedUrl = await Url.findOne({ shortUrl: "analytics-link" });

        expect(redirectResponse.statusCode).toBe(302);
        expect(storedUrl.clicks).toBe(1);
        expect(await Analytics.countDocuments({ urlId: storedUrl._id })).toBe(1);
    });
});
