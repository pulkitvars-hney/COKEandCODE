const urlmodel=require("../models/models"); 
const nanoid=require("nanoid");
async function createShortUrl(req,res){
    const {originalUrl}=req.body;
    // const originalUrl=req.body; 
    //! doing this i will store the whole object in the database and i will not be able to access the originalUrl property of the object 
    // !because it will be stored as an object in the database and i will have to access it as originalUrl.originalUrl which is not what i want
    // ! so i will destructure the object and get the originalUrl property from it
    //* originalurl will conatin{ "originalurl":"the url"} and when i try to insert it in if will have error because i have marked original uri as a string
    
    const shortUrl=nanoid.nanoid(7);
    const url=new urlmodel({
        originalUrl,
        shortUrl
    });
    await url.save();
    res.status(201).json({shortUrl});
}
module.exports={createShortUrl};