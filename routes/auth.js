const express = require('express');
const {body} = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();


router.post('/signup', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email')
        .custom(async (value, {req}) => {
            // console.log(req);
            const user = await User.findOne({ where: {email: value} });
            if (user) {
                return Promise.reject('Email already exists!');
            }
        }),
    body('fullname', 'Fullname should be between 3 to 20 letters')
        .trim()
        .isString()
        .isLength({min: 3, max: 20})
        .not().isEmpty()
        .withMessage('You cannot leave a field empty'),
    body('username')
        .trim()
        .isAlphanumeric()
        .withMessage('Username should only contain letters and numbers')
        .isLength({min: 3, max: 10})
        .withMessage('Username should be between 3 to 20 letters')
        .custom(async (value, {req})=>{
            const user = await User.findOne({ where: {username: value} });
            if (user) {
                return Promise.reject('Username already taken!');
            }
        })
        .not().isEmpty()
        .withMessage('You cannot leave a field empty'),
    body('password')
        .trim()
        .isLength({min: 8})
        .withMessage('Password should contain atleast 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]*$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword', 'Confirm Password should be same as Password')
        .trim()
        .isLength({min: 8})
        .custom((value, {req}) => {
            if(value !== req.body.password){                                 // this does not return a promise
                return Promise.reject();
            }
            return Promise.resolve();        // The custom validator should return a resolved Promise if the validation passes
        }),
    body('DOB')
    .trim()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Must be a valid date') 
],
authController.postSignup);

router.post('/login', authController.postLogin);

module.exports = router;