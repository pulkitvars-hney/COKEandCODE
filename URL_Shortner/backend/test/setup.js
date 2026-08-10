const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoserver;//? declaring this outside as we have to use it in afterALL as well

beforeAll(async () => {
    mongoserver = await MongoMemoryServer.create();

    const uri = mongoserver.getUri();

    await mongoose.connect(uri);//!Mongoose creates a connection object.-->collections
});

afterEach(async () => {
    //* their is a function called dropDatabase but we will not be using it as it delete the whole collection so 
    // MongoDB has to recreate evry time we run test does this can be slower so we will be using deletemany()
    for (const collection of Object.values(mongoose.connection.collections)) {
        await collection.deleteMany({});//!deletes all the documents in the collection
    }
})

afterAll(async () => {
    await mongoose.disconnect();

    await mongoserver.stop();
});

