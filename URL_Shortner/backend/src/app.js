const express=require("express");
const router=require("./routes/shortUrl.route");

const app =express();
app.use(express.json());

app.use("/api/create", router);

module.exports=app;