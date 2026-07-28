const express=require("express");
const { CreateUser, LoggedinUser, getCurrentUser ,refeshAccessToken, logoutuser} = require("../controllers/auth.controllers");
const { verifyjwt } = require("../middlewares/auth.middleware");
const router=express.Router();

router.post("/signup",CreateUser);
router.post('/login',LoggedinUser);
router.get("/me", verifyjwt, getCurrentUser);
router.post("/refresh-token", refeshAccessToken);
router.post("/logout",verifyjwt,logoutuser)
module.exports=router;
