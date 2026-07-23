const { findUserByEmail, findByUsername, createUser } = require("../DAo/user.dao");
const ApiError = require("../utils/ApiError");
// const { findByUsername } = require("../DAo/user.dao")

const signup = async (userdata) => {
    //userdata is an obj controller will be sending something like req.body
    const { username, email, password } = userdata;
    // if(!username||!email||!password){
    //     throw new ApiError(400,"All fields are required");
    // }
    // the above can is not able to catch this
    //     {
    //     "username": "   ",
    //     "email": "   ",
    //     "password": "   "
    // }
    if (
        !username?.trim() ||
        !email?.trim() ||
        !password?.trim()
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const emailexist = await findUserByEmail(email);
    if (emailexist) {
        throw new ApiError(409, "email already exists");
    }
    const userexists = await findByUsername(username);
    if (userexists) {
        throw new ApiError(409, "username already exists");
    }

    //sending an obj as if  i want to add things later i have to only chamge the obj not every function call and declaration

    // const User = await createuser(username, email, password);
    const createdUser = await createUser(userdata);
    return createdUser;
    // neccessary to return it as controller recieve undefined

}
module.exports = { signup };
