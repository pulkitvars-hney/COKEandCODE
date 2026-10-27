const express=require("express");
const cookieparser=require("cookie-parser");

const router=require("./routes/shortUrl.route");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const authRouter=require("./routes/auth.routes");
const { finishGoogleAuth } = require("./controllers/auth.controllers");
const analyticRouter=require("./routes/analytic.routes");
const subscriptionRouter=require("./routes/subscription.route");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const app =express();

// Enable proxy IP headers only when the deployment explicitly opts in. This
// lets analytics see the visitor's public IP behind a trusted reverse proxy
// without accepting spoofed X-Forwarded-For headers in local development.
if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
}

app.use(express.json());
app.use(cookieparser());

app.use("/", router);
app.use("/api/auth", authRouter);
app.get("/auth/google/callback", finishGoogleAuth);

app.use("/api/analytics", analyticRouter);
app.use("/", subscriptionRouter);
// Interactive API documentation is available at http://localhost:3000/api-docs.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// These must stay after the routes so normal requests get handled first.
// Unknown routes go to notFoundHandler, and all errors finish in errorHandler.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports=app;
