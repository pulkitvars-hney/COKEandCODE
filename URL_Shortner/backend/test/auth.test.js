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
        //?this test is for missing feilds
        test.each([
            ["username", {}, "username"],
            ["email", {}, "email"],
            ["password", {}, "password"],
        ])("missing %s returns 400", async (_field, body, omittedField) => {
            const response = await signupUser(body, [omittedField]);
            expect(response.statusCode).toBe(400);
        });
        //?this test is for invalid feilds
        test("invalid email returns 400", async () => {
            const response = await signupUser({ email: "not-an-email" });
            expect(response.statusCode).toBe(400);
        });

        test("invalid password returns 400", async () => {
            const response = await signupUser({ password: "weakpassword" });
            expect(response.statusCode).toBe(400);
        });
        //?this test is for duplicate feilds
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
        //?this test is for password feild should not return
        test("password is not returned", async () => {
            const response = await signupUser();
            expect(response.body.data.user.password).toBeUndefined();
        });
        //? here we are checking that the password is stored in hashed format in the database and not in plain text. We are also checking that the hashed password can be correctly compared with the original password using bcrypt's compare function.
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
        //! checking wether we are getting the user and token after sucessful login
        test("email identifier returns the user and tokens", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ identifier: validUser.email, password: validUser.password });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.user.password).toBeUndefined();
            expect(getCookie(response, "accessToken")).toBeDefined();
            expect(getCookie(response, "refreshToken")).toBeDefined();
        });
        test("username identifier returns the user and tokens", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ identifier: validUser.username, password: validUser.password });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.user.username).toBe(validUser.username);
        });
        //! testing for wrong credentials and missing feilds
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

        test("missing identifier returns 400", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ password: validUser.password });

            expect(response.statusCode).toBe(400);
        });

        test("missing password returns 400", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ identifier: validUser.email });

            expect(response.statusCode).toBe(400);
        });

        test("legacy email field remains supported", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: validUser.password });

            expect(response.statusCode).toBe(200);
        });
    });

    describe("JWT protection", () => {
        //! this test check if unauthorized user can access the protected route or not
        test("protected route rejects a missing token", async () => {
            const response = await request(app).get("/api/auth/me");
            expect(response.statusCode).toBe(401);
        });
        //!The need is to test that your authentication middleware actually verifies the token,
        // !rather than merely checking whether an Authorization header exists.
        test("protected route rejects an invalid token", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid-token");//*this is what the request will look like "Authorization: Bearer <real-access-token>"

            expect(response.statusCode).toBe(401);
        });

        test("protected route accepts a valid access token", async () => {
            await signupUser();
            //? now mongoose will have the user in the database and we can login to get the access token
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
//! here we are testing that this refresh token endpoint generates new authentication cookies when provided with a valid refresh token. 
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

        test("missing refresh token returns 401", async () => {
            const response = await request(app).post("/api/auth/refresh-token");
            expect(response.statusCode).toBe(401);
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
// !in test the firstRefresh is
// ! when i hit the api forthe first time to genrate refresh and
// ! secondRefresh is when we check if the api is rejecting the old token
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
//! here we are testing that the refresh token endpoint only allows one concurrent refresh request with the same token. This is important to prevent token reuse attacks, where an attacker could try to use the same refresh token multiple times to gain unauthorized access.
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

        test("logout clears the session", async () => {
            await signupUser();
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: validUser.password });
            const accessCookie = `accessToken=${getCookie(loginResponse, "accessToken")}`;

            const response = await request(app)
                .post("/api/auth/logout")
                .set("Cookie", accessCookie);

            expect(response.statusCode).toBe(200);
            expect(response.headers["set-cookie"].join(";")).toEqual(expect.stringContaining("accessToken="));
            expect(response.headers["set-cookie"].join(";")).toEqual(expect.stringContaining("refreshToken="));
        });

        test("logout invalidates the refresh token", async () => {
            await signupUser();
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email: validUser.email, password: validUser.password });
            const refreshToken = getCookie(loginResponse, "refreshToken");
            const accessCookie = `accessToken=${getCookie(loginResponse, "accessToken")}`;

            await request(app).post("/api/auth/logout").set("Cookie", accessCookie);
            const response = await request(app)
                .post("/api/auth/refresh-token")
                .set("Cookie", `refreshToken=${refreshToken}`);

            expect(response.statusCode).toBe(401);
        });
    });
});
