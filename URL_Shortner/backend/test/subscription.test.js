const request = require("supertest");
const app = require("../src/app");
const Subscription = require("../src/models/subscription.model");

const validUser = {
    username: "subscription_user",
    email: "subscription@example.com",
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
});
