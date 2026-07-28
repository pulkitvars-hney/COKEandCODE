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
    await newurl.save();
    
}
const getUrlsByUserId=async(userId)=>{
    return await urlschema.find({userId});
}
module.exports={saveshortUrl,getUrlsByUserId};
