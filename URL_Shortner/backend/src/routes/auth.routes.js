const express=require("express");
const { createUser, loggedinUser, getCurrentUser ,refeshAccessToken, logoutuser, forgotPassword, resetUserPassword, startGoogleAuth} = require("../controllers/auth.controllers");
const { verifyjwt } = require("../middlewares/auth.middleware");
const { signupSchema,loginSchema, forgotPasswordSchema, resetPasswordSchema } = require("../validators/auth.validators");
const {validate}=require("../middlewares/validate.middleware");
const router=express.Router();

router.post("/signup",validate(signupSchema),createUser);
router.post('/login',validate(loginSchema),loggedinUser);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetUserPassword);
router.get('/google', startGoogleAuth);
router.get("/me", verifyjwt, getCurrentUser);
router.post("/refresh-token", refeshAccessToken);
router.post("/logout",verifyjwt,logoutuser)
module.exports=router;
