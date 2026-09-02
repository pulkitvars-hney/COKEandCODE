const mongoose=require("mongoose");
const {updateProUrlExpiry,getUrlById,upgradeUrlById,upgradeFreeUrlsByUserId}=require("../DAo/url.dao")
const {createSubscription,getActiveSubscriptionByUserId,getSubscriptionHistory,deactivateSubscription,expireSubscriptionsByUserId}=require("../DAo/subscription.DAO");
const ApiError=require("../utils/ApiError");
// const subscription=require("../models/subscription.model");

const createDefaultSubscription=async(userId)=>{
    const currentPeriodStart= new Date();
    const currentPeriodEnd=new Date(currentPeriodStart);;
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth()+1);
    return await createSubscription({
        userId,
        currentPeriodStart,
        currentPeriodEnd,
    });
}

const currentSubscription=async(userId)=>{
    let subscription=await getActiveSubscriptionByUserId(userId);
    if(!subscription){
        subscription=await createDefaultSubscription(userId);
    }
    return subscription;
}

const SubscriptionHistory=async(userId)=>{
    return await getSubscriptionHistory(userId);
}

const upgradeSubscription=async(userId,newPlan)=>{
    const session=await mongoose.startSession();

    try {
        let newSubscription;

        await session.withTransaction(async()=>{
            const activesubscription=await getActiveSubscriptionByUserId(userId,session);
            if(!activesubscription){
                throw new ApiError(404,"No active subscription found")
            }
            if(activesubscription.plan===newPlan){
                throw new ApiError(400,"user is already subscribed to this  plan");
            }

            await deactivateSubscription(activesubscription._id,session);

            const currentPeriodStart = new Date();
            const currentPeriodEnd = new Date(currentPeriodStart);
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

            newSubscription = await createSubscription({
                userId,
                plan: newPlan,
                currentPeriodStart,
                currentPeriodEnd
            },session);
        });

        return newSubscription;
    } finally {
        await session.endSession();
    }
}

const expireUserSubscription=async(userId)=>{
    return await expireSubscriptionsByUserId(userId);
}

// A Pro URL expires at the subscription period end plus three days.
// This mirrors the expiry rule used when creating new Pro URLs.
const proUrlExpiryFromSubscription=(subscription)=>{
    const expiresAt=new Date(subscription.currentPeriodEnd);
    expiresAt.setDate(expiresAt.getDate()+3);
    return expiresAt;
}

const requireActiveProSubscription=async(userId)=>{
    const subscription=await getActiveSubscriptionByUserId(userId);
    if(!subscription||subscription.plan!=="pro"){
        throw new ApiError(403,"An active Pro subscription is required");
    }
    return subscription;
}

// Explicit URL-level upgrade: only plan, subscriptionId, and expiresAt change.
// Destination, short code, owner, clicks, and analytics are never touched.
const upgradeUrlToPro=async(userId,urlId)=>{
    const subscription=await requireActiveProSubscription(userId);

    const url=await getUrlById(urlId);
    if(!url){
        throw new ApiError(404,"No url found");
    }
    if(String(url.userId)!==String(userId)){
        throw new ApiError(403,"Access forbidden");
    }
    if(url.plan==="pro"){
        throw new ApiError(409,"URL is already on the Pro plan");
    }
    if(!url.expiresAt||url.expiresAt<=new Date()){
        throw new ApiError(400,"Expired URLs cannot be upgraded");
    }

    const setData={
        plan:"pro",
        subscriptionId:subscription._id,
        expiresAt:proUrlExpiryFromSubscription(subscription),
    };
    return await upgradeUrlById(url._id,setData);
}

// Bulk promotion of every eligible Free link the user owns.
// The DAO filter selects only unexpired Free URLs of this owner, so already-Pro
// links and other users' links can never be modified. Each promoted document is
// independently valid, so a plain updateMany (no transaction) is sufficient.
const upgradeAllUrlsToPro=async(userId)=>{
    const subscription=await requireActiveProSubscription(userId);

    const setData={
        plan:"pro",
        subscriptionId:subscription._id,
        expiresAt:proUrlExpiryFromSubscription(subscription),
    };
    const result=await upgradeFreeUrlsByUserId(userId,setData);
    return {
        matchedCount:result.matchedCount??0,
        modifiedCount:result.modifiedCount??0,
    };
}
module.exports={createDefaultSubscription,currentSubscription,SubscriptionHistory,upgradeSubscription,expireUserSubscription,upgradeUrlToPro,upgradeAllUrlsToPro};
