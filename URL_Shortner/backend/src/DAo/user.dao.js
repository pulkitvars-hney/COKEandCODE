const mongoose =require("mongoose")
const userschema=require("../models/user.model")
 const createUser=async (userdata)=>{
    // userdata is a obj 

    const user=new userschema(userdata);
    await user.save();
    return user;
 }
 // finding the user by email;
 const findUserByEmail=async(email)=>{
    return await userschema.findOne({email});
 };
 //finding by username
 const findByUsername=async(username)=>{
    return await userschema.findOne({username});

 }
 // find by user id
 const findByUserID=async(id)=>{
    return await userschema.findById(id);

 };
 // update refresh token
 const updateRefreshToken= async(id,refreshtoken)=>{
    return await userschema.findByIdAndUpdate(id,{refreshtoken},{new:true});
 };


 module.exports={
    createUser,
    findByUserID,
    findByUsername,
    findUserByEmail,
    updateRefreshToken
 };

