const User=require("../models/user.model")
const removeRefreshToken=async(id)=>{
    return await User.findByIdAndUpdate(id,{
        refreshToken:"",
        refreshTokenJti:""
    },
{
    returnDocument:"after"
})
}
module.exports={removeRefreshToken};
