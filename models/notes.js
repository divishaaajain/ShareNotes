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
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { toJSON: {  
        virtuals: true, 
        transform: function(doc, ret) {
            delete ret._id; 
            delete ret.__v;
        }
    }, 
    timestamps: true
});

notesSchema.virtual('id').get(function() {
    return this._id;
});

module.exports = mongoose.model('Note', notesSchema);