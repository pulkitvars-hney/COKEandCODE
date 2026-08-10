const request = require("supertest");
const app = require("../src/app");
const Url = require("../src/models/url.models");

const user = {
    username: "analytics_test_user",
    email: "analytics-test@example.com",
    password: "Password@123",
};

const getCookie = (response, name) => {
    const cookie = response.headers["set-cookie"]?.find((value) => value.startsWith(`${name}=`));
    return cookie?.split(";")[0].split("=")[1];
};

const createUserCookie = async (userData = user) => {
    await request(app).post("/api/auth/signup").send(userData);
    const login = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: userData.password,
    });
    return `accessToken=${getCookie(login, "accessToken")}`;
};

const createTrackedUrl = async (cookie) => {
    await request(app)
        .post("/api/url/create")
        .set("Cookie", cookie)
        .send({ originalUrl: "https://example.com/analytics-target", alias: "analytics-target" });
    return Url.findOne({ shortUrl: "analytics-target" });
};

describe("Analytics API", () => {
    test("returns overview analytics for an owned URL", async () => {
        const cookie = await createUserCookie();
        const url = await createTrackedUrl(cookie);
        await request(app).get("/api/analytics-target");

        const response = await request(app)
            .get(`/api/analytics/${url._id}/overview`)
            .set("Cookie", cookie);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.totalClicks).toBe(1);
        expect(response.body.data.timeline).toEqual(expect.any(Array));
    });

    test("returns recent clicks for an owned URL", async () => {
        const cookie = await createUserCookie();
        const url = await createTrackedUrl(cookie);
        await request(app).get("/api/analytics-target");

        const response = await request(app)
            .get(`/api/analytics/${url._id}/recent?limit=10`)
            .set("Cookie", cookie);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toEqual(expect.objectContaining({
            browser: expect.any(String),
            os: expect.any(String),
        }));
    });

    test("rejects analytics access for another user", async () => {
        const ownerCookie = await createUserCookie();
        const url = await createTrackedUrl(ownerCookie);
        const otherCookie = await createUserCookie({
            username: "analytics_other_user",
            email: "analytics-other@example.com",
            password: "Password@123",
        });

        const response = await request(app)
            .get(`/api/analytics/${url._id}/overview`)
            .set("Cookie", otherCookie);

        expect(response.statusCode).toBe(403);
    });
});
