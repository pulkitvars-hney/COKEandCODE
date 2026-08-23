const subscriptionSchema=require("../models/subscription.model");

const createSubscription=async(subscriptionData,session=null)=>{
    const newSubscription=new subscriptionSchema({
        userId:subscriptionData.userId,
        //plan status have defualt;
        // these will come null when user create account first time thus mongoose will make use of default
        plan:subscriptionData.plan,
        status:subscriptionData.status,
        currentPeriodStart:subscriptionData.currentPeriodStart,
        currentPeriodEnd:subscriptionData.currentPeriodEnd

    })
    return await newSubscription.save({session});
}

//?Find this user's subscription that is marked active and whose current subscription period has not ended.
const getActiveSubscriptionByUserId=async(userId,session=null)=>{
      return await subscriptionSchema.findOne({
        userId,
        status: "active",
        currentPeriodEnd: { $gt: new Date() }
    }).session(session);
}

const expireSubscriptionsByUserId=async(userId)=>{
    return await subscriptionSchema.updateMany({
        userId,
        status:"active",
        currentPeriodEnd:{$lte:new Date()},
    },
    {
            $set:{
                status:"expired",
            }
        })
}

const getSubscriptionHistory=async(userId)=>{
    return await subscriptionSchema.find({
        userId,
    }).sort({createdAt:-1});//!-1 helps in getting the newer one first
}

const deactivateSubscription = async (subscriptionId,session=null) => {
    return await subscriptionSchema.findByIdAndUpdate(
        subscriptionId,
        {
            status: "cancelled",
        },
        {
            returnDocument: "after",
            session,
        }
    );
};
const getSubscriptionById = async (subscriptionId) => {
    return await subscriptionSchema.findById(subscriptionId);
};
module.exports={createSubscription,getActiveSubscriptionByUserId,getSubscriptionHistory,deactivateSubscription,expireSubscriptionsByUserId,getSubscriptionById}
