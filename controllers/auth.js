const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const uploadHelper = require('../helpers/upload');

exports.postSignup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error(errors.array()[0].msg)
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        let imageUrl = '';
        const image = req.file;
        if(image){
            const cloudImage = await uploadHelper.fileUpload(image.path);
            imageUrl = cloudImage.secure_url;
        }
        const password = req.body.password;
        const email = req.body.email;
        const username = req.body.username;
        const fullname = req.body.fullname;
        const DOB = req.body.DOB;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email, 
            password: hashedPassword, 
            username: username, 
            fullname: fullname, 
            DOB: DOB, 
            imageUrl: imageUrl 
        });
        const savedUser = await user.save();
        if (!savedUser) {
            next(new Error('Failed to signup'));
        }
        return res.status(201).json({ message: "Signed up successfully", user_id: savedUser._id.toString() });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('Enter a valid email address');
            error.statusCode = 404
            throw error;
        }
        const result = await bcrypt.compare(password, user.password);
        if (result) {
            const token = jwt.sign({
                email: user.email,
                user_id: user._id.toString()
            }, `${process.env.JWT_PRIVATE_KEY}`, {
                expiresIn: '1h'
            });
            return res.status(200).json({message: "User logged in", user_id: user._id.toString(), token: token});   
        }
        const error = new Error('Incorrect Password');
        error.statusCode = 422
        throw error; 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};