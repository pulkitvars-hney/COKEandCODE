const mongoose=require("mongoose");

const subscriptionSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        index:true,
        required:true,
    },
    plan:{
        type:String,
        enum:["free","pro"],
        default:"free",
        required:true,
    },
    status:{
        type:String,
        enum:["active","cancelled","expired"],
        default:"active",
        required:true,
    },
     currentPeriodStart:{
        type:Date,
        required:true,
     },
    currentPeriodEnd:{

        type:Date,
        required:true,
    },
    // "Has the user requested cancellation, but wants to keep using the plan until the current billing period ends?"
    cancelAtPeriodEnd:{
        type:Boolean,
        required:true,
        default:false,
    },
    provider:{
        type:String,
        enum:["stripe"],
        default:null,
    },
    customerId:{
        type:String,
        default:null,

    },
    externalSubscriptionId:{
        type:String,
        default:null,
    }
},{timestamps:true});
module.exports=mongoose.model("subscription",subscriptionSchema);