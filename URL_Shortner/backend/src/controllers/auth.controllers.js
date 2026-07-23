const ApiError = require("../utils/ApiError");
const {signup}=require("../services/auth.services")
const asyncHandler=require("../utils/asyncHandler")
const CreateUser=asyncHandler(async (req,res)=> {
    const createdUser=await signup(req.body);
    if(createdUser){
        res.status(201).json({
            success:true,
            message:"user created successfully",
            data:createdUser
        })
    }
})
module.exports={
    CreateUser
}