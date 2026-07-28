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
    }

},{timestamps:true})
module.exports=mongoose.model("Url", urlSchema);