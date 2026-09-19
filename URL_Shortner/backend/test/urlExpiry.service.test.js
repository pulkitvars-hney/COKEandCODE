const User = require("../src/models/user.model");
const Url = require("../src/models/url.models");
const userDao = require("../src/DAo/user.dao");
const { expireUrlService } = require("../src/services/shorturlhelper.service");

const createUser = async (overrides = {}) => {
    return User.create({
        username: "expiry_user",
        email: "expiry@example.com",
        password: "Password@123",
        activeFreeUrlCount: 1,
        ...overrides,
    });
};

const createExpiredUrl = async (user, overrides = {}) => {
    return Url.create({
        originalUrl: "https://example.com/expired",
        shortUrl: "expired-link",
        userId: user._id,
        plan: "free",
        status: "active",
        expiresAt: new Date(Date.now() - 1_000),
        ...overrides,
    });
};

describe("URL expiry service", () => {
    test("expires a Free URL and releases one Free-plan slot", async () => {
        const user = await createUser();
        const url = await createExpiredUrl(user);

        const expired = await expireUrlService(url._id);

        expect(expired.status).toBe("expired");
        expect((await User.findById(user._id)).activeFreeUrlCount).toBe(0);
    });

    test("makes a Free-plan slot reservable after expiration", async () => {
        const user = await createUser();
        const url = await createExpiredUrl(user);

        await expireUrlService(url._id);
        const reservedUser = await userDao.reserveFreeUrlSlot(user._id);

        expect(reservedUser).not.toBeNull();
        expect(reservedUser.activeFreeUrlCount).toBe(1);
    });

    test("expires a Pro URL without changing the Free-plan counter", async () => {
        const user = await createUser({ activeFreeUrlCount: 3 });
        const url = await createExpiredUrl(user, {
            shortUrl: "expired-pro-link",
            plan: "pro",
        });

        const expired = await expireUrlService(url._id);

        expect(expired.status).toBe("expired");
        expect((await User.findById(user._id)).activeFreeUrlCount).toBe(3);
    });

    test("does not release a Free-plan slot twice when the same URL is expired twice", async () => {
        const user = await createUser();
        const url = await createExpiredUrl(user);

        await expireUrlService(url._id);
        const secondAttempt = await expireUrlService(url._id);

        expect(secondAttempt).toBeNull();
        expect((await User.findById(user._id)).activeFreeUrlCount).toBe(0);
    });
});
