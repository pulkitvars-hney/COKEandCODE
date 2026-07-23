// import mongoose, { Schema } from "mongoose";
// import bcrypt from "bcrypt"
const mongoose=require("mongoose");
const {Schema}=require("mongoose");
const bcrypt=require("bcrypt");
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

// !this will help in saving the password with a hash not plain text and like hashing then saving the pasword can cause error
// !this helps as you will not have to worry every time

userSchema.pre("save", async function () {
    //* pre is the middle ware thus next is used
    // *save is  mongoose event middle ware name
    //* If the password hasn't changed, don't hash it again.
    if (!this.isModified("password")) { // is modified checks wether the pasword is modified or usually help in login
        return ;
    }

    // Hash the password before saving.
    this.password = await bcrypt.hash(this.password, 10);

    // next();
});
userSchema.methods.isPasswordCorrect= async function(password){
    //! here arrow function can not be  used as arrow function does not have this of their own thus you have to use normal function
    //! if you use this in arrow function it will return the outer scope 
    //! but if you print the this of normal function you will get the whole user;
return bcrypt.compare(password,this.password);
};

//? GENRAL RULE  ALWAYS USE FUNCTION WHEN YOU WANT TO USE "this"
//? Because Mongoose binds this to the current document. Arrow functions don't have their own this,
//? so they can't access document properties like this.password or this.isModified().
// export const User=mongoose.model("User",userSchema);
module.exports=mongoose.model("User",userSchema);