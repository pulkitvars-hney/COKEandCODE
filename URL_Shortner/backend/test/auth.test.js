const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const User = require("../src/models/user.model");

const validUser = {
    username: "pulkit_varshney",
    email: "pulkitvarshney@gmail.com",
    password: "Password@123",
};

const signupUser = (overrides = {}, omit = []) => {
    const body = { ...validUser, ...overrides };
    omit.forEach((field) => delete body[field]);
    return request(app)
        .post("/api/auth/signup")
        .send(body);
};

const getCookie = (response, name) => {
    const cookie = response.headers["set-cookie"]?.find((value) => value.startsWith(`${name}=`));
    return cookie?.split(";")[0].split("=")[1];
};

describe("Authentication API", () => {
    describe("Signup", () => {
        test("valid signup returns the user", async () => {
            const response = await signupUser();

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toEqual(expect.objectContaining({
                username: validUser.username,
                email: validUser.email,
            }));
        });

        test.each([
            ["username", {}, "username"],
            ["email", {}, "email"],
            ["password", {}, "password"],
        ])("missing %s returns 400", async (_field, body, omittedField) => {
            const response = await signupUser(body, [omittedField]);
            expect(response.statusCode).toBe(400);
        });

        test("invalid email returns 400", async () => {
            const response = await signupUser({ email: "not-an-email" });
            expect(response.statusCode).toBe(400);
        });

        test("invalid password returns 400", async () => {
            const response = await signupUser({ password: "weakpassword" });
            expect(response.statusCode).toBe(400);
        });

        test("duplicate username returns 409", async () => {
            await signupUser();
            const response = await signupUser({ email: "another@example.com" });
            expect(response.statusCode).toBe(409);
        });

        test("duplicate email returns 409", async () => {
            await signupUser();
            const response = await signupUser({ username: "another_user" });
            expect(response.statusCode).toBe(409);
        });

        test("password is not returned", async () => {
            const response = await signupUser();
            expect(response.body.data.user.password).toBeUndefined();
        });

        test("password is stored hashed", async () => {
            await signupUser();
            const storedUser = await User.findOne({ email: validUser.email });

            expect(storedUser.password).not.toBe(validUser.password);
            await expect(bcrypt.compare(validUser.password, storedUser.password)).resolves.toBe(true);
        });
    });

    describe("Login", () => {
        beforeEach(async () => {
            await signupUser();
        });

        test("valid credentials return the user and tokens", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: validUser.password });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.user.password).toBeUndefined();
            expect(getCookie(response, "accessToken")).toBeDefined();
            expect(getCookie(response, "refreshToken")).toBeDefined();
        });

        test("wrong email returns 401", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ email: "wrong@example.com", password: validUser.password });

            expect(response.statusCode).toBe(401);
        });

        test("wrong password returns 401", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: "WrongPassword@123" });

            expect(response.statusCode).toBe(401);
        });

        test("missing email returns 400", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ password: validUser.password });

            expect(response.statusCode).toBe(400);
        });

        test("missing password returns 400", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("JWT protection", () => {
        test("protected route rejects a missing token", async () => {
            const response = await request(app).get("/api/auth/me");
            expect(response.statusCode).toBe(401);
        });

        test("protected route rejects an invalid token", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid-token");

            expect(response.statusCode).toBe(401);
        });

        test("protected route accepts a valid access token", async () => {
            await signupUser();
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: validUser.password });
            const accessToken = getCookie(loginResponse, "accessToken");

            const response = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.user.email).toBe(validUser.email);
        });

        test("refresh token generates new authentication cookies", async () => {
            await signupUser();
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: validUser.password });
            const refreshToken = getCookie(loginResponse, "refreshToken");

            const response = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", `refreshToken=${refreshToken}`);

            expect(response.statusCode).toBe(200);
            expect(getCookie(response, "accessToken")).toBeDefined();
            expect(getCookie(response, "refreshToken")).toBeDefined();
        });

        test("rejects reuse of the old refresh token after rotation", async () => {
            await signupUser();
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: validUser.password });
            const oldRefreshToken = getCookie(loginResponse, "refreshToken");

            const firstRefresh = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", `refreshToken=${oldRefreshToken}`);
            const secondRefresh = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", `refreshToken=${oldRefreshToken}`);

            expect(firstRefresh.statusCode).toBe(200);
            expect(secondRefresh.statusCode).toBe(401);
        });

        test("rejects a malformed refresh token", async () => {
            const response = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", "refreshToken=not-a-jwt");

            expect(response.statusCode).toBe(401);
        });

        test("rejects an expired refresh token", async () => {
            await signupUser();
            const expiredToken = jwt.sign(
                { _id: "507f1f77bcf86cd799439011", jti: "expired-jti" },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "-1s" }
            );

            const response = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", `refreshToken=${expiredToken}`);

            expect(response.statusCode).toBe(401);
        });

        test("allows only one concurrent refresh with the same token", async () => {
            await signupUser();
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: validUser.password });
            const refreshCookie = `refreshToken=${getCookie(loginResponse, "refreshToken")}`;

            const [first, second] = await Promise.all([
                request(app).post("/api/auth/refresh-token").set("Cookie", refreshCookie),
                request(app).post("/api/auth/refresh-token").set("Cookie", refreshCookie),
            ]);
            const statuses = [first.statusCode, second.statusCode].sort();

            expect(statuses).toEqual([200, 401]);
        });
    });
});
