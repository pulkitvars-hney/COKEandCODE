const mongoose=require("mongoose");

const urlSchema=new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    clicks:{
        type:Number,
        required:true,
        default:0,

    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index:true,
    },
    plan: {
    type: String,
    enum: ["free", "pro"],
    required: true,
},

subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subscription",
    default: null,
},
    expiresAt:{
        type:Date,
        default:null,
        index:true,
    }

},{timestamps:true})
module.exports=mongoose.model("Url", urlSchema);