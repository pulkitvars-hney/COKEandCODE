const express=require("express");
const cookieparser=require("cookie-parser");

const router=require("./routes/shortUrl.route");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const authRouter=require("./routes/auth.routes");
const app =express();

app.use(express.json());
app.use(cookieparser());

app.use("/", router);
app.use("/api/auth", authRouter);
// These must stay after the routes so normal requests get handled first.
// Unknown routes go to notFoundHandler, and all errors finish in errorHandler.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports=app;
