const { signup } = require("../services/auth.services");
const asyncHandler = require("../utils/asyncHandler");
const { login } = require("../services/login.service");
const User = require("../models/user.model");
const ApiResponse = require("../utils/ApiResponse");
const CreateUser=asyncHandler(async (req,res)=> {
    const createdUser=await signup(req.body);
    // Query the document again so password and refresh tokens never leave the API.
    const user = await User.findById(createdUser._id).select("-password -refreshToken");
    res.status(201).json(new ApiResponse(201, { user }, "User created successfully"));
})
const LoggedinUser= asyncHandler(async(req,res)=>{
    const { user, refreshToken, accessToken } = await login(req.body);

    // Send a sanitized user object rather than exposing credential fields.
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");
    const options={
    httpOnly:true,
    // Secure cookies require HTTPS, so enable them in production but allow local HTTP development.
    secure: process.env.NODE_ENV === "production",
};
return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,
            },
            "login Successful"
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // verifyjwt attaches the already-sanitized authenticated user to the request.
    res.status(200).json(new ApiResponse(200, { user: req.user }, "User retrieved successfully"));
});

module.exports={
    CreateUser,
    LoggedinUser,
    getCurrentUser
}
