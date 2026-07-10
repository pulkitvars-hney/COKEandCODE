const mongose =require("mongoose");
const urlschema=require("../models/models.js");


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
module.exports={saveshortUrl};
