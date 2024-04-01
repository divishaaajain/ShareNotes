const {validationResult} = require('express-validator');

const Notes = require('../models/notes');
const uploadHelper = require('../helpers/upload');


exports.getNotes = async (req, res, next) => {
    try {
        const notes = await Notes.find({userId : req.userId});
        if (!notes) {
            const error = new Error ('Notes not found');
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json({message: 'Notes retrieved', notes: notes})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postNotes = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error(errors.array()[0].msg);
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const tags = req.body.tags;
        tags.forEach((tag) => {
            if((!/^#[a-zA-Z0-9]+$/.test(tag)) || (!tag.length>1)){
                const error = new Error('Tags must start with # followed by only alphabets and/or numbers');
                error.statusCode = 422;
                throw error;                                                
            }
        });
        const files = req.file.path;
        if(!files){
            const error = new Error('No file provided');
            error.statusCode = 422;
            throw error;
        }
        const cloudFile = await uploadHelper.fileUpload(files);
        const title = req.body.title;
        const description = req.body.description;
        const filesUrl = cloudFile.secure_url;
        const notes = new Notes({title: title, desciption: description, tags: tags, filesUrl: filesUrl, userId: req.userId});
        const savedNotes = await notes.save();
        if(!savedNotes) {
            throw new Error();
        }
        res.status(201).json({message: "File uploaded successfully", notes: savedNotes, creator: req.userId});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};