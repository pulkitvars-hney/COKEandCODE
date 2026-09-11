const request = require("supertest");
const app = require("../src/app");
const Url = require("../src/models/url.models");
const Analytics = require("../src/models/analytic.model");
const Subscription = require("../src/models/subscription.model");

const user = {
    username: "url_upgrade_user",
    email: "url-upgrade@example.com",
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

const upgradeAccountToPro = async (cookie) => {
    return request(app)
        .post("/api/subscription/upgrade")
        .set("Cookie", cookie)
        .send({ plan: "pro" });
};

const getActiveProSubscription = (userId) =>
    Subscription.findOne({ userId, plan: "pro", status: "active" });

const createOwnedUrl = async (cookie, originalUrl, alias) => {
    const response = await request(app)
        .post("/api/url/create")
        .set("Cookie", cookie)
        .send({ originalUrl, alias });
    expect(response.statusCode).toBe(201);
    return Url.findOne({ shortUrl: alias });
};

const proExpiryFor = (subscription) => {
    const expiresAt = new Date(subscription.currentPeriodEnd);
    expiresAt.setDate(expiresAt.getDate() + 3);
    return expiresAt;
};

describe("URL-level Pro upgrade API", () => {
    describe("POST /api/url/:id/upgrade", () => {
        test("lets the owner upgrade an eligible Free URL", async () => {
            const cookie = await createAuthCookie();
            const url = await createOwnedUrl(cookie, "https://example.com/free-link", "free-link");

            const upgradeResponse = await upgradeAccountToPro(cookie);
            expect(upgradeResponse.statusCode).toBe(200);
            const subscription = await getActiveProSubscription(url.userId);

            const response = await request(app)
                .post(`/api/url/${url._id}/upgrade`)
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(200);
            const upgraded = await Url.findById(url._id);
            expect(upgraded.plan).toBe("pro");
            expect(String(upgraded.subscriptionId)).toBe(String(subscription._id));
            expect(upgraded.expiresAt.getTime()).toBe(proExpiryFor(subscription).getTime());
            // Non-subscription fields must survive the promotion untouched.
            expect(upgraded.originalUrl).toBe(url.originalUrl);
            expect(upgraded.shortUrl).toBe(url.shortUrl);
            expect(String(upgraded.userId)).toBe(String(url.userId));
        });

        test("preserves clicks and click history across an upgrade", async () => {
            const cookie = await createAuthCookie();
            const url = await createOwnedUrl(cookie, "https://example.com/clicked", "clicked-link");
            await request(app).get("/api/clicked-link");
            await upgradeAccountToPro(cookie);
            const subscription = await getActiveProSubscription(url.userId);

            const response = await request(app)
                .post(`/api/url/${url._id}/upgrade`)
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(200);
            const upgraded = await Url.findById(url._id);
            expect(upgraded.clicks).toBe(1);
            expect(await Analytics.countDocuments({ urlId: url._id })).toBe(1);
            expect(upgraded.originalUrl).toBe("https://example.com/clicked");
        });

        test("rejects an unauthenticated upgrade", async () => {
            const cookie = await createAuthCookie();
            const url = await createOwnedUrl(cookie, "https://example.com/authless", "authless-link");

            const response = await request(app)
                .post(`/api/url/${url._id}/upgrade`);

            expect(response.statusCode).toBe(401);
        });

        test("prevents upgrading another user's URL", async () => {
            const ownerCookie = await createAuthCookie();
            const url = await createOwnedUrl(ownerCookie, "https://example.com/private-up", "private-up");

            const otherUser = {
                username: "url_upgrade_other",
                email: "url-upgrade-other@example.com",
                password: "Password@123",
            };
            const otherCookie = await createAuthCookie(otherUser);
            // Prime lazy subscription creation, then promote the attacker's account,
            // so the denial below can only come from the ownership check.
            await request(app).get("/api/subscription/current").set("Cookie", otherCookie);
            await upgradeAccountToPro(otherCookie);

            const response = await request(app)
                .post(`/api/url/${url._id}/upgrade`)
                .set("Cookie", otherCookie);

            expect(response.statusCode).toBe(403);
            const unchanged = await Url.findById(url._id);
            expect(unchanged.plan).toBe("free");
            expect(unchanged.subscriptionId).toBeNull();
        });

        test("returns 404 for an unknown URL id", async () => {
            const cookie = await createAuthCookie();
            // Subscriptions are created lazily; prime one so the account upgrade succeeds.
            await request(app).get("/api/subscription/current").set("Cookie", cookie);
            await upgradeAccountToPro(cookie);

            const response = await request(app)
                .post(`/api/url/${"a".repeat(24)}/upgrade`)
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(404);
        });

        test("returns 400 for a malformed URL id", async () => {
            const cookie = await createAuthCookie();
            await upgradeAccountToPro(cookie);

            const response = await request(app)
                .post("/api/url/not-an-id/upgrade")
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(400);
        });

        test("rejects upgrading a URL that is already Pro", async () => {
            const cookie = await createAuthCookie();
            const url = await createOwnedUrl(cookie, "https://example.com/already-pro", "already-pro");
            await upgradeAccountToPro(cookie);

            const firstResponse = await request(app)
                .post(`/api/url/${url._id}/upgrade`)
                .set("Cookie", cookie);
            expect(firstResponse.statusCode).toBe(200);
            const firstSubscription = await getActiveProSubscription(url.userId);

            const response = await request(app)
                .post(`/api/url/${url._id}/upgrade`)
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(409);
            const unchanged = await Url.findById(url._id);
            expect(unchanged.plan).toBe("pro");
            expect(String(unchanged.subscriptionId)).toBe(String(firstSubscription._id));
            expect(unchanged.expiresAt.getTime()).toBe(proExpiryFor(firstSubscription).getTime());
        });

        test("rejects URL upgrades without an active Pro subscription", async () => {
            const cookie = await createAuthCookie();
            const url = await createOwnedUrl(cookie, "https://example.com/still-free", "still-free");

            const response = await request(app)
                .post(`/api/url/${url._id}/upgrade`)
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(403);
            const unchanged = await Url.findById(url._id);
            expect(unchanged.plan).toBe("free");
            expect(unchanged.subscriptionId).toBeNull();
        });

        test("rejects upgrading an expired Free URL", async () => {
            const cookie = await createAuthCookie();
            const url = await createOwnedUrl(cookie, "https://example.com/expired-free", "expired-free");
            await Url.updateOne(
                { _id: url._id },
                { $set: { expiresAt: new Date(Date.now() - 1_000) } }
            );
            await upgradeAccountToPro(cookie);

            const response = await request(app)
                .post(`/api/url/${url._id}/upgrade`)
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(400);
            const unchanged = await Url.findById(url._id);
            expect(unchanged.plan).toBe("free");
            expect(unchanged.subscriptionId).toBeNull();
        });
    });

    describe("POST /api/url/upgrade-all", () => {
        test("upgrades every eligible Free URL owned by the user", async () => {
            const cookie = await createAuthCookie();
            const urlA = await createOwnedUrl(cookie, "https://example.com/bulk-a", "bulk-a");
            const urlB = await createOwnedUrl(cookie, "https://example.com/bulk-b", "bulk-b");
            await upgradeAccountToPro(cookie);
            const subscription = await getActiveProSubscription(urlA.userId);

            const response = await request(app)
                .post("/api/url/upgrade-all")
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toEqual(expect.objectContaining({
                matchedCount: 2,
                modifiedCount: 2,
            }));

            for (const original of [urlA, urlB]) {
                const upgraded = await Url.findById(original._id);
                expect(upgraded.plan).toBe("pro");
                expect(String(upgraded.subscriptionId)).toBe(String(subscription._id));
                expect(upgraded.expiresAt.getTime()).toBe(proExpiryFor(subscription).getTime());
            }
        });

        test("does not modify another user's URLs", async () => {
            const ownerCookie = await createAuthCookie();
            const url = await createOwnedUrl(ownerCookie, "https://example.com/untouched", "untouched");

            const otherUser = {
                username: "url_bulk_other",
                email: "url-bulk-other@example.com",
                password: "Password@123",
            };
            const otherCookie = await createAuthCookie(otherUser);
            await request(app).get("/api/subscription/current").set("Cookie", otherCookie);
            await upgradeAccountToPro(otherCookie);

            const response = await request(app)
                .post("/api/url/upgrade-all")
                .set("Cookie", otherCookie);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.modifiedCount).toBe(0);
            const unchanged = await Url.findById(url._id);
            expect(unchanged.plan).toBe("free");
            expect(unchanged.subscriptionId).toBeNull();
        });

        test("skips already-Pro URLs safely", async () => {
            const cookie = await createAuthCookie();
            const freeUrl = await createOwnedUrl(cookie, "https://example.com/skip-free", "skip-free");
            await upgradeAccountToPro(cookie);
            const subscription = await getActiveProSubscription(freeUrl.userId);
            const proUrl = await createOwnedUrl(cookie, "https://example.com/skip-pro", "skip-pro");
            expect(proUrl.plan).toBe("pro");

            const response = await request(app)
                .post("/api/url/upgrade-all")
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toEqual(expect.objectContaining({
                matchedCount: 1,
                modifiedCount: 1,
            }));
            const unchanged = await Url.findById(proUrl._id);
            expect(String(unchanged.subscriptionId)).toBe(String(subscription._id));
            expect(unchanged.expiresAt.getTime()).toBe(proExpiryFor(subscription).getTime());
        });

        test("skips expired Free URLs", async () => {
            const cookie = await createAuthCookie();
            const activeUrl = await createOwnedUrl(cookie, "https://example.com/live", "live-link");
            const expiredUrl = await createOwnedUrl(cookie, "https://example.com/dead", "dead-link");
            await Url.updateOne(
                { _id: expiredUrl._id },
                { $set: { expiresAt: new Date(Date.now() - 1_000) } }
            );
            await upgradeAccountToPro(cookie);
            const subscription = await getActiveProSubscription(activeUrl.userId);

            const response = await request(app)
                .post("/api/url/upgrade-all")
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.modifiedCount).toBe(1);

            const promoted = await Url.findById(activeUrl._id);
            expect(promoted.plan).toBe("pro");
            expect(String(promoted.subscriptionId)).toBe(String(subscription._id));

            const skipped = await Url.findById(expiredUrl._id);
            expect(skipped.plan).toBe("free");
            expect(skipped.subscriptionId).toBeNull();
        });

        test("returns zero counts when no eligible Free URLs exist", async () => {
            const cookie = await createAuthCookie();
            await request(app).get("/api/subscription/current").set("Cookie", cookie);
            await upgradeAccountToPro(cookie);

            const response = await request(app)
                .post("/api/url/upgrade-all")
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toEqual(expect.objectContaining({
                matchedCount: 0,
                modifiedCount: 0,
            }));
        });

        test("rejects bulk upgrades without an active Pro subscription", async () => {
            const cookie = await createAuthCookie();
            await createOwnedUrl(cookie, "https://example.com/no-pro", "no-pro");

            const response = await request(app)
                .post("/api/url/upgrade-all")
                .set("Cookie", cookie);

            expect(response.statusCode).toBe(403);
            expect(await Url.findOne({ shortUrl: "no-pro" }).then((url) => url.plan)).toBe("free");
        });
    });

    describe("POST /api/subscription/upgrade validation", () => {
        test("rejects a missing plan without touching subscriptions", async () => {
            const cookie = await createAuthCookie();

            const before = await Subscription.countDocuments();

            const response = await request(app)
                .post("/api/subscription/upgrade")
                .set("Cookie", cookie)
                .send({});

            expect(response.statusCode).toBe(400);
            expect(await Subscription.countDocuments()).toBe(before);
        });

        test("rejects an unsupported plan value", async () => {
            const cookie = await createAuthCookie();
            const before = await Subscription.countDocuments();

            const response = await request(app)
                .post("/api/subscription/upgrade")
                .set("Cookie", cookie)
                .send({ plan: "gold" });

            expect(response.statusCode).toBe(400);
            expect(await Subscription.countDocuments()).toBe(before);
        });
    });
});
