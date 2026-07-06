require('dotenv').config();
const connectToDatabase = require('./src/database/db');
const app = require("./src/app");


async function startServer() {
  await connectToDatabase();
  app.listen(3000,()=>{
    console.log("Server is running on port 3000");
  })    }
 startServer();
