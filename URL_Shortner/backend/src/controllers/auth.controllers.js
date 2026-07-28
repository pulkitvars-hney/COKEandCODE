const { signup } = require("../services/auth.services");
const { login, generateAccessandRefreshToken } = require("../services/login.service");
const {removeRefreshToken}=require("../DAo/removerefreshToken")
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");
const jwt=require("jsonwebtoken");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const CreateUser = asyncHandler(async (req, res) => {
    const createdUser = await signup(req.body);
    // Query the document again so password and refresh tokens never leave the API.
    const user = await User.findById(createdUser._id).select("-password -refreshToken");
    res.status(201).json(new ApiResponse(201, { user }, "User created successfully"));
})

const LoggedinUser = asyncHandler(async (req, res) => {
    const { user, refreshToken, accessToken } = await login(req.body);

    // Send a sanitized user object rather than exposing credential fields.
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");
    const options = {
        httpOnly: true,
        // Secure cookies require HTTPS, so enable them in production but allow local HTTP development.
        secure: process.env.NODE_ENV === "production",
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
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
    try {
        const decode = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decode._id);

        if (!user||user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "invalid refresh token");
        }

        // const newRefreshToken = user.generateRefreshToken();
        // const newAccessToken = user.generateAccessToken();

        // user.refreshToken = newRefreshToken;
        // await user.save({ validateBeforeSave: false });
        // instead of manually doing this i have a user method
        const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                success: true,
                message: "Tokens refreshed successfully",
            });
    } catch (error) {
        throw new ApiError(401, "Refresh token is invalid or expired");
    }
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
    CreateUser,
    LoggedinUser,
    getCurrentUser,
    refeshAccessToken,
    logoutuser
}
