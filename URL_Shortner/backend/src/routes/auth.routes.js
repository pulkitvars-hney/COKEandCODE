const express=require("express");
const {CreateUser}=require("../controllers/auth.controllers")
const asyncHadler=require("../utils/asyncHandler");
const router=express.Router();

router.post("/signup",CreateUser);
module.exports=router;