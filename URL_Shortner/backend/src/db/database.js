const dns=require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);


const mongoose=require("mongoose");

async function connectToDatabase(){
    try{
        await mongoose.connect(process.env.mongodb_key);
        console.log("Connected to MongoDB");
    }catch(error){
        console.error("Error connecting to MongoDB:",error);
        process.exit(1);
    }
}
module.exports=connectToDatabase;
