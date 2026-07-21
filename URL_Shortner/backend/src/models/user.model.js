import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase:true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    refreshToken: {
        type:String,
        default:"",
    },
    avatar: {
    type: String,
    default: "",
},
},{timestamps:true})

// !this will help in saving the password with a hash not plain text and like hashing then saving the pasword can cause error
// !this helps as you will not have to worry every time

userSchema.pre("save", async function (next) {
    // *save is  mongoose event middle ware name
    //* If the password hasn't changed, don't hash it again.
    if (!this.isModified("password")) { // is modified checks wether the pasword is modified or usually help in login
        return next();
    }

    // Hash the password before saving.
    this.password = await bcrypt.hash(this.password, 10);

    next();
});

export const User=mongoose.model("User",userSchema);