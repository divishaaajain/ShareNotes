const mongoose = require('mongoose');

const Schema = mongoose.Schema;

notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desciption: {
        type: String,
        require: true
    },
    filesUrl: [
        {
            type: String,
            required: true
        }
    ],
    tags: {
        type: Array
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Note', notesSchema);