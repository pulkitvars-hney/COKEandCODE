const request = require("supertest");
const app = require("../src/app");
const Subscription = require("../src/models/subscription.model");

const validUser = {
    username: "subscription_user",
    email: "subscription@example.com",
    password: "Password@123",
};

const freshUser = {
    username: "fresh_sub_user",
    email: "fresh-sub@example.com",
    password: "Password@123",
};

const createAuthenticatedUser = async () => {
    const signupResponse = await request(app)
        .post("/api/auth/signup")
        .send(validUser);

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });

    return {
        userId: signupResponse.body.data.user._id,
        accessToken: loginResponse.headers["set-cookie"]
            .find((value) => value.startsWith("accessToken="))
            .split(";")[0],
    };
};

describe("Subscription API", () => {
    test("upgrading atomically cancels the old subscription and creates the new plan", async () => {
        const { userId, accessToken } = await createAuthenticatedUser();

        const currentResponse = await request(app)
            .get("/api/subscription/current")
            .set("Cookie", accessToken);
        expect(currentResponse.statusCode).toBe(200);

        const upgradeResponse = await request(app)
            .post("/api/subscription/upgrade")
            .set("Cookie", accessToken)
            .send({ plan: "pro" });

        expect(upgradeResponse.statusCode).toBe(200);
        expect(upgradeResponse.body.data).toEqual(expect.objectContaining({
            plan: "pro",
            status: "active",
        }));

        const subscriptions = await Subscription.find({ userId });
        expect(subscriptions).toHaveLength(2);
        expect(subscriptions.filter((subscription) => subscription.status === "active")).toHaveLength(1);
        expect(subscriptions.find((subscription) => subscription.plan === "free").status).toBe("cancelled");
    });

    test("account upgrade returns 404 when no subscription record exists", async () => {
        const signupResponse = await request(app)
            .post("/api/auth/signup")
            .send(freshUser);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: freshUser.email, password: freshUser.password });

        const accessToken = loginResponse.headers["set-cookie"]
            .find((value) => value.startsWith("accessToken="))
            .split(";")[0];

        const subscriptionCount = await Subscription.countDocuments();

        const upgradeResponse = await request(app)
            .post("/api/subscription/upgrade")
            .set("Cookie", accessToken)
            .send({ plan: "pro" });

        expect(upgradeResponse.statusCode).toBe(404);
        expect(await Subscription.countDocuments()).toBe(subscriptionCount);
    });

    test("subscription history returns records sorted newest first", async () => {
        const { userId, accessToken } = await createAuthenticatedUser();

        await request(app).get("/api/subscription/current").set("Cookie", accessToken);
        await request(app).post("/api/subscription/upgrade").set("Cookie", accessToken).send({ plan: "pro" });

        const response = await request(app)
            .get("/api/subscription/history")
            .set("Cookie", accessToken);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.length).toBe(2);
        expect(response.body.data[0].plan).toBe("pro");
        expect(response.body.data[1].plan).toBe("free");
    });
});
