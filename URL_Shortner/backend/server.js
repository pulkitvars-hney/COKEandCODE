require('dotenv').config();

const app=require('./src/app');
const connectToDatabase=require('./src/db/database');

async function startserever(){

    await connectToDatabase();

   app.listen(3000,()=>{
        console.log("server is running on port 3000");
    })
}
startserever();