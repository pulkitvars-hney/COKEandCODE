const usermodel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
async function registerUser(req, res) {
    const { username, email, password, role } = req.body;
    const isuserfound = await usermodel.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });
    if (isuserfound) {
        return res.status(409).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);//10 is a salt rounds
    const user = await usermodel.create({
        username,
        email,
        password: hashedPassword,
        role,
    });
    const token = jwt.sign({
        id: user._id, role: user.role
    },
        process.env.jwt_secret,
        { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json({
        message: 'User created successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
}
async function loginUser(req, res) {
    const { username,email, password } = req.body;
    const user = await usermodel.findOne({ 
        $or:[
            {username},
            {email}
        ]

    });
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({message: 'Invalid password'});
    }
    const token = jwt.sign({
        id: user._id, role: user.role
    },
        process.env.jwt_secret,
        { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });

}
module.exports = {
    registerUser,
    loginUser
};