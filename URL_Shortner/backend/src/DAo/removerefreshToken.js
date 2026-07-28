const User=require("../models/user.model")
const removeRefreshToken=async(id)=>{
    return await User.findByIdAndUpdate(id,{
        refreshToken:""
    },
{
    new:true
})
}
module.exports={removeRefreshToken};