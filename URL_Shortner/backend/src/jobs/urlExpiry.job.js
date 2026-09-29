const cron = require("node-cron");
const saveurl=require("../DAo/url.dao");
const {expireUrlService}=require("../services/shorturlhelper.service");

const startUrlExpiryjob=()=>{
    // What */1 * * * * means

// It runs every minute:

// 12:00 → check
// 12:01 → check
// 12:02 → check
// 12:03 → check
    cron.schedule("*/1 * * * *",async()=>{
        let expiredUrls;
        try {
            expiredUrls=await saveurl.findexpiredActiveUrls();
        }catch(error){
            console.error("url expiry job failed",error);
            return;
        }
        for(const url of expiredUrls){
            try {
                await expireUrlService(url._id);
            } catch (error) {
                console.error(`url expiry job failed for url ${url._id}`,error);
            }
        }
    });

    console.log("URL expiry job started");
};
module.exports={
    startUrlExpiryjob
}