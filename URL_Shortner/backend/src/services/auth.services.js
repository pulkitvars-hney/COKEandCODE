const { findUserByEmail, findByUsername, createUser } = require("../DAo/user.dao");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const crypto = require("crypto");
// const { findByUsername } = require("../DAo/user.dao")

const signup = async (userdata) => {
    // `userdata` is the plain object received from req.body, already
    // validated by signupSchema on the route.
    const { username, email, password } = userdata;
    const emailexist = await findUserByEmail(email);
    if (emailexist) {
        throw new ApiError(409, "email already exists");
    }
    const userexists = await findByUsername(username);
    if (userexists) {
        throw new ApiError(409, "username already exists");
    }

    // Pass one object so future user fields can be added without changing every function signature.
    const createdUser = await createUser(userdata);
    
    return createdUser; // The controller needs the created document to build its response.
}

const createPasswordReset = async (email) => {
    const user = await findUserByEmail(email);
    // The caller intentionally returns the same response whether or not an
    // account exists, preventing email-address enumeration.
    if (!user) return null;

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // This token must only be supplied to a configured email-delivery adapter.
    // It is deliberately never returned or logged by the API.
    return resetToken;
};

const resetPassword = async (resetToken, password) => {
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const user = await User.findOne({
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpiresAt");

    if (!user) throw new ApiError(400, "This reset link is invalid or has expired");

    user.password = password;
    user.passwordResetToken = "";
    user.passwordResetExpiresAt = null;
    user.refreshToken = "";
    user.refreshTokenJti = "";
    await user.save();
};

const getAvailableGoogleUsername = async (email, displayName) => {
    const rawBase = (displayName || email.split("@")[0] || "shortly_user")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 16) || "shortly_user";
    const base = rawBase.length < 3 ? `${rawBase}user` : rawBase;

    for (let suffix = 0; suffix < 100; suffix += 1) {
        const candidate = suffix ? `${base.slice(0, 20 - String(suffix).length)}${suffix}` : base;
        if (!await findByUsername(candidate)) return candidate;
    }
    return `user${crypto.randomBytes(6).toString("hex")}`.slice(0, 20);
};

const getOrCreateGoogleUser = async ({ sub, email, email_verified: emailVerified, name }) => {
    if (!sub || !email || !emailVerified) {
        throw new ApiError(400, "Google did not provide a verified email address");
    }

    const normalizedEmail = email.toLowerCase();
    const googleUser = await User.findOne({ googleId: sub });
    if (googleUser) return googleUser;

    // A verified Google email may safely link an existing local account.
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
        existingUser.googleId = sub;
        await existingUser.save({ validateBeforeSave: false });
        return existingUser;
    }

    const username = await getAvailableGoogleUsername(normalizedEmail, name);
    return createUser({
        username,
        email: normalizedEmail,
        googleId: sub,
        // Google accounts do not use this value for login; it satisfies the
        // existing password schema without storing any OAuth secret.
        password: `Aa1!${crypto.randomBytes(32).toString("hex")}`,
    });
};

module.exports = { signup, createPasswordReset, resetPassword, getOrCreateGoogleUser };
