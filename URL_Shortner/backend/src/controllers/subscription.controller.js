const {currentSubscription,
    SubscriptionHistory,
    upgradeSubscription,
    cancelSubscription
} = require("../services/subscription.service");

const ApiResponse=require("../utils/ApiResponse");

const getCurrentSubscription=async(req,res)=>{
    const subscription=await currentSubscription(req.user._id);
    return res.status(200).json(new ApiResponse(200,subscription,"current subscription fetched sucessfully"));
};

const getSubscriptionHistory = async (req, res) => {
    const subscriptions = await SubscriptionHistory(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            subscriptions,
            "Subscription history fetched successfully"
        )
    );
};

const upgradeSubscriptionController = async (req, res) => {
    const { plan } = req.body;

    const subscription = await upgradeSubscription(
        req.user._id,
        plan
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            subscription,
            "Subscription upgraded successfully"
        )
    );
};

module.exports = {
    getCurrentSubscription,
    getSubscriptionHistory,
    upgradeSubscriptionController
};