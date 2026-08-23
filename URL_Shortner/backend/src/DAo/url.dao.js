const mongose =require("mongoose");
const urlschema=require("../models/url.models.js");


const saveshortUrl=async (shorturl,longurl,userId,expiresAt ,plan,
    subscriptionId)=>{
    const newurl=new urlschema({
        originalUrl:longurl,
        shortUrl:shorturl,
        expiresAt,
         plan,
    subscriptionId
    })
    if(userId){
        newurl.userId=userId;
    }
   return await newurl.save();
    
}

const getUrlsByUserId=async(userId)=>{
    return await urlschema.find({userId});
}

const getUrlById=async(Id)=>{
    return await urlschema.findById(Id);
}

const findByShortUrl = async (shortUrl) => {
    return await urlschema.findOne({ shortUrl });
}

const deletUrl=async(Id)=>{
    return await urlschema.findByIdAndDelete(Id);
}

const countActiveUrlsByUser=async(userId)=>{
    return await urlschema.countDocuments({
        userId:userId,
        expiresAt:{$gt:new Date()}
    });// needs one filter object, and inside that object we're giving it two conditions:
}

const updateProUrlExpiry = async (subscriptionId, expiresAt) => {
    return await urlschema.updateMany(
        {
            subscriptionId,
            plan: "pro",
        },
        {
            $set: {
                expiresAt,
            },
        }
    );
};

module.exports={saveshortUrl,getUrlsByUserId,getUrlById,findByShortUrl,deletUrl,countActiveUrlsByUser,updateProUrlExpiry};
