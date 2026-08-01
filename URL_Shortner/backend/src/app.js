const express=require("express");
const cookieparser=require("cookie-parser");

const router=require("./routes/shortUrl.route");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const authRouter=require("./routes/auth.routes");
const analyticRouter=require("./routes/analytic.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const app =express();

app.use(express.json());
app.use(cookieparser());

app.use("/", router);
app.use("/api/auth", authRouter);

app.use("/api/analytics", analyticRouter);
// Interactive API documentation is available at http://localhost:3000/api-docs.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// These must stay after the routes so normal requests get handled first.
// Unknown routes go to notFoundHandler, and all errors finish in errorHandler.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports=app;
