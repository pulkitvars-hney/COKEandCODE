const express=require("express");
const router=require("./routes/shortUrl.route");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const router2=require("../src/routes/auth.routes")
const app =express();
app.use(express.json());

app.use("/", router);
app.use("/api/auth",router2)
// These must stay after the routes so normal requests get handled first.
// Unknown routes go to notFoundHandler, and all errors finish in errorHandler.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports=app;
