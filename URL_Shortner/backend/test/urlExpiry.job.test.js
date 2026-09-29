const mockSchedule = jest.fn();

jest.mock("node-cron", () => ({
    schedule: mockSchedule,
}));

const User = require("../src/models/user.model");
const Url = require("../src/models/url.models");
const saveurl = require("../src/DAo/url.dao");
const { startUrlExpiryjob } = require("../src/jobs/urlExpiry.job");

const createUser = async (overrides = {}) => {
    return User.create({
        username: "expiry_job_user",
        email: "expiry-job@example.com",
        password: "Password@123",
        activeFreeUrlCount: 1,
        ...overrides,
    });
};

const createUrl = async (user, overrides = {}) => {
    return Url.create({
        originalUrl: "https://example.com/expiry-job",
        shortUrl: "expiry-job-link",
        userId: user._id,
        plan: "free",
        status: "active",
        expiresAt: new Date(Date.now() - 1_000),
        ...overrides,
    });
};

describe("URL expiry scheduler", () => {
    let tick;
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeAll(() => {
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        startUrlExpiryjob();
        tick = mockSchedule.mock.calls[0][1];
    });

    afterAll(() => {
        consoleLogSpy.mockRestore();
    });

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test("registers the expiry sweep on a one-minute cron", () => {
        expect(mockSchedule).toHaveBeenCalledWith(
            "*/1 * * * *",
            expect.any(Function)
        );
    });

    test("expiry job expires every past-due Free URL and releases its slot", async () => {
        const userA = await createUser({
            username: "job_a",
            email: "job-a@example.com",
        });
        const expired = await createUrl(userA, { shortUrl: "job-a-expired" });

        const userB = await createUser({
            username: "job_b",
            email: "job-b@example.com",
        });
        const live = await createUrl(userB, {
            shortUrl: "job-b-live",
            expiresAt: new Date(Date.now() + 60_000),
        });

        await tick();

        expect((await Url.findById(expired._id)).status).toBe("expired");
        expect((await User.findById(userA._id)).activeFreeUrlCount).toBe(0);
        expect((await Url.findById(live._id)).status).toBe("active");
        expect((await User.findById(userB._id)).activeFreeUrlCount).toBe(1);
    });

    test("does not select URLs with a null expiresAt for expiry", async () => {
        const user = await createUser();
        const pastDue = await createUrl(user, { shortUrl: "job-null-past" });
        const nullExpiry = await createUrl(user, {
            shortUrl: "job-null-link",
            expiresAt: null,
        });

        const swept = await saveurl.findexpiredActiveUrls();
        expect(swept.map((url) => url.shortUrl)).toEqual(["job-null-past"]);

        await tick();

        expect((await Url.findById(pastDue._id)).status).toBe("expired");
        expect((await Url.findById(nullExpiry._id)).status).toBe("active");
    });

    test("logs a failing URL and still processes the remaining URLs in the same tick", async () => {
        // Desynced owner: the Free URL is active but the counter is already 0,
        // so slot release is impossible and expireUrlService aborts the
        // transaction for this URL only.
        const desynced = await createUser({
            username: "job_desync",
            email: "job-desync@example.com",
            activeFreeUrlCount: 0,
        });
        const poison = await createUrl(desynced, { shortUrl: "job-poison" });

        const healthyOne = await createUser({
            username: "job_healthy_one",
            email: "job-healthy-one@example.com",
        });
        const healthyUrlOne = await createUrl(healthyOne, {
            shortUrl: "job-healthy-one",
        });

        const healthyTwo = await createUser({
            username: "job_healthy_two",
            email: "job-healthy-two@example.com",
        });
        const healthyUrlTwo = await createUrl(healthyTwo, {
            shortUrl: "job-healthy-two",
        });

        await tick();

        expect((await Url.findById(poison._id)).status).toBe("active");
        expect(consoleErrorSpy).toHaveBeenCalled();

        expect((await Url.findById(healthyUrlOne._id)).status).toBe("expired");
        expect((await User.findById(healthyOne._id)).activeFreeUrlCount).toBe(0);
        expect((await Url.findById(healthyUrlTwo._id)).status).toBe("expired");
        expect((await User.findById(healthyTwo._id)).activeFreeUrlCount).toBe(0);
    });
});