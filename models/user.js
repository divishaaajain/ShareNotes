const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
        unique: true
    },
    fullname: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
    },
    DOB: {
        type: Sequelize.DATE,
        allowNull: false,
        required: true
    },
    imageUrl: {
        type: Sequelize.STRING,
    }   
}, { timestamps: true });

module.exports = User;


// const mongoose = require('mongoose');

// const Schema = mongoose.Schema;

// const userSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     fullname: {
//         type: String,
//         required: true
//     },
//     username: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     DOB: {
//         type: Date,
//         require: true
//     }, 
//     imageUrl: {
//         type: String
//     }
// }, { toJSON: {  
//         virtuals: true, 
//         transform: function(doc, ret) {
//             delete ret._id;
//             delete ret.__v;
//         }
//     }, 
//     timestamps: true
// });

// userSchema.virtual('id').get(function() {
//     return this._id;
// });

// module.exports = mongoose.model('User', userSchema);

