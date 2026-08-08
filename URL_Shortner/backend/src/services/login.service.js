const {findUserByEmail,findByUsername}=require("../DAo/user.dao");
const ApiError=require("../utils/ApiError");
const User=require("../models/user.model");
const crypto = require("crypto");
const login=async(userdata)=>{
    // userdata is a plain JavaScript object received from req.body
    // Login validation normalizes the submitted email before it reaches this service.
    const {email,password}=userdata;
     if (
        !email?.trim() ||
        !password?.trim()
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await findUserByEmail(email);
    // user is a Mongoose document, so it has schema methods
    if(!user){
        // Use 401 for both cases so the response does not reveal whether an account exists.
        throw new ApiError(401,"Invalid credentials");

    }
    const isvalid=await user.isPasswordCorrect(password);
    if(!isvalid){
        // Use the same public error as a missing user for the same reason.
        throw new ApiError(401, "Invalid credentials");
    }

    const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id);
     return {
        user,
        refreshToken,
        accessToken
     };

}

const generateAccessandRefreshToken=async(userId)=>{
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"invalid Id")
    }
    const accessToken=user.generateAccessToken();
    
    const refreshTokenJti = crypto.randomUUID();
    const refreshToken=user.generateRefreshToken(refreshTokenJti);
    user.refreshToken=refreshToken;
    user.refreshTokenJti=refreshTokenJti;
    await user.save({validateBeforeSave:false});
    // Only refreshToken changes here, so skip validation of unrelated required fields.
    return {accessToken,refreshToken};
}

// Rotate the refresh token with an atomic compare-and-swap. If another request
// already consumed this JTI, the update matches nothing and this request fails.
const rotateAccessandRefreshToken = async (userId, currentJti) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = user.generateAccessToken();
    const refreshTokenJti = crypto.randomUUID();
    const refreshToken = user.generateRefreshToken(refreshTokenJti);
    const rotatedUser = await User.findOneAndUpdate(
        { _id: userId, refreshTokenJti: currentJti },
        { $set: { refreshToken, refreshTokenJti } },
        { returnDocument: "after", runValidators: false }
    );

    if (!rotatedUser) {
        throw new ApiError(401, "Refresh token has already been used");
    }

    return { accessToken, refreshToken };
};

module.exports={login,generateAccessandRefreshToken,rotateAccessandRefreshToken};
