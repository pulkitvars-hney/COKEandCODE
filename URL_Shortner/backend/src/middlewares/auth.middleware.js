
const User=require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const jwt=require("jsonwebtoken");

const verifyjwt = asyncHandler(async(req,res,next)=>{
    // Accept the HTTP-only cookie or a standard Bearer token for API clients.
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace(/^Bearer\s+/i, "");
    if(!token){
        throw new ApiError(401,"Unauthorized Request");
    }

    let decodedToken;
    try {
        decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401,"Invalid or expired access token");
    }
    // A valid signature is not enough: the associated account must still exist.
    // Access tokens are signed with `_id` in user.model.js; use that same claim to load the user.
    const authenticatedUser=await User.findById(decodedToken._id).select("-password -refreshToken");

    if(!authenticatedUser){
        throw new ApiError(401,"Invalid Access Token");
    }
    req.user=authenticatedUser;
    next();
})
module.exports={verifyjwt};
