const cookieOptions={
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax"
}

module.exports={cookieOptions};