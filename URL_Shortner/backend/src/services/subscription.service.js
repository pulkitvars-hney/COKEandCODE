const mongoose=require("mongoose");
const{updateProUrlExpiry}=require("../DAo/url.dao")
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
module.exports={createDefaultSubscription,currentSubscription,SubscriptionHistory,upgradeSubscription,expireUserSubscription};
