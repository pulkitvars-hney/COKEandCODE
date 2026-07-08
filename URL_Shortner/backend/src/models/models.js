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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }

})
module.exports=mongoose.model("Url", urlSchema);