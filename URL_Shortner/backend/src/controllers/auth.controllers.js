const { signup, createPasswordReset, resetPassword, getOrCreateGoogleUser } = require("../services/auth.services");
const { login, generateAccessandRefreshToken, rotateAccessandRefreshToken } = require("../services/login.service");
const {removeRefreshToken}=require("../DAo/removerefreshToken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");
const jwt=require("jsonwebtoken");
const crypto = require("crypto");
const {cookieOptions}=require("../constant/cookieOptions");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createUser = asyncHandler(async (req, res) => {
    const createdUser = await signup(req.body);
    // New accounts should behave like a normal login: issue a session without
    // returning credential fields in the response body.
    const { accessToken, refreshToken } = await generateAccessandRefreshToken(createdUser._id);
    const user = await User.findById(createdUser._id).select("-password -refreshToken");
    res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(201, { user }, "User created and signed in successfully"));
})

const loggedinUser = asyncHandler(async (req, res) => {
    const { user, refreshToken, accessToken } = await login(req.body);

    // Send a sanitized user object rather than exposing credential fields.
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser,
            },
                "login Successful"
            )
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // verifyjwt attaches the already-sanitized authenticated user to the request.
    res.status(200).json(new ApiResponse(200, { user: req.user }, "User retrieved successfully"));
});

const refeshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh Token is missing");
    }
    let decoded;
    try {
         decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        } catch (error) {
            throw new ApiError(401, "Refresh token is invalid or expired");
        }
        if (!decoded.jti) {
            throw new ApiError(401, "Refresh token is invalid or expired");
        }
        const {accessToken,refreshToken}=await rotateAccessandRefreshToken(decoded._id, decoded.jti);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200,{},"Access token refreshed successfully"));
})

const logoutuser=asyncHandler(async(req,res)=>{
    
    await removeRefreshToken(req.user._id);
  
 return res
        .status(200)
        .clearCookie("accessToken",cookieOptions)
        .clearCookie("refreshToken",cookieOptions)
        .json(
            new ApiResponse(
                200,
                {},
                "Logged out succesfully",
            )
        );
});

const forgotPassword = asyncHandler(async (req, res) => {
    await createPasswordReset(req.body.email);
    // A generic response protects users from account-discovery attempts.
    res.status(200).json(new ApiResponse(200, {}, "If an account exists for that email, password-reset instructions are being prepared."));
});

const resetUserPassword = asyncHandler(async (req, res) => {
    await resetPassword(req.params.token, req.body.password);
    res.status(200).json(new ApiResponse(200, {}, "Password reset successfully. Please log in."));
});

const googleStateCookie = "google_oauth_state";
const googleStateCookieOptions = { ...cookieOptions, maxAge: 10 * 60 * 1000 };

const startGoogleAuth = (req, res) => {
    const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CALLBACK_URL) {
        throw new ApiError(500, "Google sign-in is not configured");
    }

    const state = crypto.randomBytes(32).toString("hex");
    const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorizationUrl.search = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_CALLBACK_URL,
        response_type: "code",
        scope: "openid email profile",
        state,
        prompt: "select_account",
    }).toString();

    res.cookie(googleStateCookie, state, googleStateCookieOptions).redirect(authorizationUrl.toString());
};

const finishGoogleAuth = asyncHandler(async (req, res) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const expectedState = req.cookies?.[googleStateCookie];
    const receivedState = req.query.state;
    res.clearCookie(googleStateCookie, cookieOptions);

    if (req.query.error || !expectedState || typeof receivedState !== "string" || expectedState.length !== receivedState.length || !crypto.timingSafeEqual(Buffer.from(expectedState), Buffer.from(receivedState))) {
        return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL || typeof req.query.code !== "string") {
        return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code: req.query.code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_CALLBACK_URL,
            grant_type: "authorization_code",
        }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) return res.redirect(`${clientUrl}/login?error=google_auth_failed`);

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileResponse.json();
    if (!profileResponse.ok) return res.redirect(`${clientUrl}/login?error=google_auth_failed`);

    const user = await getOrCreateGoogleUser(profile);
    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);
    return res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .redirect(`${clientUrl}/dashboard`);
});

module.exports = {
    createUser,
    loggedinUser,
    getCurrentUser,
    refeshAccessToken,
    logoutuser,
    forgotPassword,
    resetUserPassword,
    startGoogleAuth,
    finishGoogleAuth
}
