require('dotenv').config();

const app=require('./src/app');

const connectToDatabase=require('./src/db/database');

async function startserever(){

    await connectToDatabase();

   const port = Number(process.env.PORT) || 3000;
   app.listen(port,()=>{
        console.log(`server is running on port ${port}`);
    })
}

startserever();
