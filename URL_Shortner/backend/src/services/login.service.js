const {findUserByEmail,findByUsername}=require("../DAo/user.dao");
const ApiError=require("../utils/ApiError");
const User=require("../models/user.model");
const login=async(userdata)=>{
    // userdata is a plain JavaScript object received from req.body
    const {identifier,password}=userdata;
     if (
        !identifier?.trim() ||
        !password?.trim()
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const user= identifier.includes("@")?await findUserByEmail(identifier):await findByUsername(identifier);
    // user is a Mongoose document, so it has schema methods
    if(!user){
        throw new ApiError(404,"Invalid credentials");

    }
    const isvalid=await user.isPasswordCorrect(password);
    if(!isvalid){
        throw new ApiError(404, "Invalid credentials");
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
    
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});
//     Why validateBeforeSave: false?
// Because you're only updating the refreshToken field.
    return {accessToken,refreshToken};
}

module.exports={login,generateAccessandRefreshToken};