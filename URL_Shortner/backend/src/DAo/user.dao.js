const mongoose =require("mongoose")
const userschema=require("../models/user.model");
const FREE_URL_LIMIT = parseInt(process.env.FREE_URL_LIMIT);
 const createUser=async (userdata)=>{
    // userdata is a obj 

    const user=new userschema(userdata);
    await user.save();
    return user;
 }
 // finding the user by email;
 const findUserByEmail=async(email)=>{
    return await userschema.findOne({email});
 };

 //finding by username
 const findByUsername=async(username)=>{
    return await userschema.findOne({username});

 }

 // find by user id
 const findByUserID=async(id)=>{
    return await userschema.findById(id);

 };

 // update refresh token
 const updateRefreshToken= async(id,refreshToken)=>{
    return await userschema.findByIdAndUpdate(id,{refreshToken},{returnDocument:"after"});
 };

 // reserve free url slot
 const reserveFreeUrlSlot = async (userId, session) => {
    return await userschema.findOneAndUpdate({
        _id: userId,
        activeFreeUrlCount: { $lt: FREE_URL_LIMIT }
    },
    {
        $inc:{ activeFreeUrlCount: 1 }
    },
    {
        session,
        new:true
    }
    );
}

// release free url slot
const releaseFreeUrlSlot = async (userId, session) => {
    return await userschema.findOneAndUpdate(
        {
            _id: userId,
            activeFreeUrlCount: { $gt: 0 }
        },
        {
            $inc: {
                activeFreeUrlCount: -1
            }
        },
        {
            session,
            returnDocument: "after"
        }
    );
};

 module.exports={
    createUser,
    findByUserID,
    findByUsername,
    findUserByEmail,
    updateRefreshToken,
    reserveFreeUrlSlot,
    releaseFreeUrlSlot
 };

