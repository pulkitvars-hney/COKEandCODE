const mongoose =require("mongoose")
const userschema=require("../models/user.model");
const { FREE_URL_LIMIT } = require("../constant/freeUrlLimit");
const { FREE_QR_LIMIT } = require("../constant/freeQrLimit");
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
        returnDocument: "after"
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

const releaseFreeUrlSlots = async (userId, count, session) => {
    return await userschema.findOneAndUpdate(
        {
            _id: userId,
            activeFreeUrlCount: { $gte: count },
        },
        {
            $inc: {
                activeFreeUrlCount: -count,
            },
        },
        {
            session,
            returnDocument: "after",
        }
    );
};

// A reservation id lets one request release only its own slot if Cloudinary,
// Workers AI, or persistence fails while other QR requests are in flight.
const reserveFreeQrGeneration = async (userId, reservationId) => userschema.findOneAndUpdate(
    {
        _id: userId,
        $expr: {
            $lt: [
                {
                    $add: [
                        { $ifNull: ["$qrGenerationCount", 0] },
                        { $size: { $ifNull: ["$qrGenerationReservations", []] } },
                    ],
                },
                FREE_QR_LIMIT,
            ],
        },
    },
    { $addToSet: { qrGenerationReservations: reservationId } },
    { returnDocument: "after" }
);

const completeFreeQrGeneration = async (userId, reservationId) => userschema.findOneAndUpdate(
    { _id: userId, qrGenerationReservations: reservationId },
    { $pull: { qrGenerationReservations: reservationId }, $inc: { qrGenerationCount: 1 } },
    { returnDocument: "after" }
);

const releaseFreeQrGeneration = async (userId, reservationId) => userschema.updateOne(
    { _id: userId, qrGenerationReservations: reservationId },
    { $pull: { qrGenerationReservations: reservationId } }
);

 module.exports={
    createUser,
    findByUserID,
    findByUsername,
    findUserByEmail,
    updateRefreshToken,
    reserveFreeUrlSlot,
    releaseFreeUrlSlot,
    releaseFreeUrlSlots,
    reserveFreeQrGeneration,
    completeFreeQrGeneration,
    releaseFreeQrGeneration,
};

