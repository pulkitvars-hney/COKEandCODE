const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");
const { currentSubscription } = require("../src/services/subscription.service");
const { reserveQrGeneration, completeQrGeneration, releaseQrGeneration, getQrGenerationUsage } = require("../src/services/qrQuota.service");

test("Free QR reservations are concurrency-safe and failures release their own slot", async () => {
    const signup = await request(app).post("/api/auth/signup").send({
        username: "qr_quota_user", email: "qr-quota@example.com", password: "Password@123",
    });
    expect(signup.statusCode).toBe(201);
    const user = await User.findOne({ email: "qr-quota@example.com" });
    await currentSubscription(user._id);

    const attempts = await Promise.allSettled(Array.from({ length: 11 }, () => reserveQrGeneration(user._id)));
    const reservations = attempts.filter((attempt) => attempt.status === "fulfilled").map((attempt) => attempt.value);
    expect(reservations).toHaveLength(10);
    expect(attempts.filter((attempt) => attempt.status === "rejected")).toHaveLength(1);

    await Promise.all(reservations.map((reservation) => releaseQrGeneration(user._id, reservation)));
    expect((await getQrGenerationUsage(user._id)).remaining).toBe(10);

    const completed = await reserveQrGeneration(user._id);
    await completeQrGeneration(user._id, completed);
    expect(await getQrGenerationUsage(user._id)).toEqual(expect.objectContaining({ plan: "free", used: 1, remaining: 9 }));
});
