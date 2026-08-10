module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
};


// !jest can run test in different environment 
// *browser environment - jsdom this is used for react testing 
// Jest
//    │
// Fake Browser
//    │
// document
// window
// localStorage

// !node envronment 
//? we have to tell jest that we are running in node environment so that it can provide us with the node specific apis like fs, path, etc.