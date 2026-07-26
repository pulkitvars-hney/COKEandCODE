// import mongoose, { Schema } from "mongoose";
// import bcrypt from "bcrypt"
const mongoose=require("mongoose");
const {Schema}=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
require('dotenv').config();

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase:true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    refreshToken: {
        type:String,
        default:"",
    },
    avatar: {
    type: String,
    default: "",
},
},{timestamps:true})

userSchema.pre("save", async function () {
    // `save` is a Mongoose middleware event. Run this hook before the user document is stored.
    // Avoid hashing the already-hashed password when saving unrelated changes, such as refreshToken.
    if (!this.isModified("password")) {
        return ;
    }

    // Hash the password before saving.
    this.password = await bcrypt.hash(this.password, 10);

    // next();
});
userSchema.methods.isPasswordCorrect= async function(password){
    // Use a regular function: Mongoose binds `this` to the current user document.
    // Arrow functions use the surrounding `this`, so `this.password` would not refer to this user.
    return bcrypt.compare(password,this.password);
};

userSchema.methods.generateAccessToken=function () {
   // jwt.sign is synchronous. Keep only identity claims needed by protected routes in the access token.
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    });
} 
userSchema.methods.generateRefreshToken=function () {
    return jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    });
}

module.exports=mongoose.model("User",userSchema);
