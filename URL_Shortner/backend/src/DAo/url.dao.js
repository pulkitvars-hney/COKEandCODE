const mongose =require("mongoose");
const urlschema=require("../models/url.models.js");


const saveshortUrl=async (shorturl,longurl,userid)=>{
    const newurl=new urlschema({
        originalUrl:longurl,
        shortUrl:shorturl
    })
    if(userid){
        newurl.userId=userid;
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

module.exports={saveshortUrl,getUrlsByUserId,getUrlById,findByShortUrl,deletUrl};
