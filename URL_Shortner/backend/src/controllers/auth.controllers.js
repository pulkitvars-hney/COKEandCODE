const { signup } = require("../services/auth.services");
const { login, generateAccessandRefreshToken, rotateAccessandRefreshToken } = require("../services/login.service");
const {removeRefreshToken}=require("../DAo/removerefreshToken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");
const jwt=require("jsonwebtoken");
const {cookieOptions}=require("../constant/cookieOptions");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createUser = asyncHandler(async (req, res) => {
    const createdUser = await signup(req.body);
    // Query the document again so password and refresh tokens never leave the API.
    const user = await User.findById(createdUser._id).select("-password -refreshToken");
    res.status(201).json(new ApiResponse(201, { user }, "User created successfully"));
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
  
const options={
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax"
};
 return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            new ApiResponse(
                200,
                {},
                "Logged out succesfully",
            )
        );
});

module.exports = {
    createUser,
    loggedinUser,
    getCurrentUser,
    refeshAccessToken,
    logoutuser
}
