const { findUserByEmail, findByUsername, createUser } = require("../DAo/user.dao");
const ApiError = require("../utils/ApiError");
// const { findByUsername } = require("../DAo/user.dao")

const signup = async (userdata) => {
    // `userdata` is the plain object received from req.body.
    const { username, email, password } = userdata;
    // A simple truthy check accepts "   "; trim() rejects whitespace-only values too.
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

    // Pass one object so future user fields can be added without changing every function signature.
    const createdUser = await createUser(userdata);
    return createdUser; // The controller needs the created document to build its response.
}
module.exports = { signup };
