const {validationResult} = require('express-validator');

const Notes = require('../models/notes');
const uploadHelper = require('../helpers/upload');


exports.getNotes = async (req, res, next) => {
    const user_id = req.params.user_id;
    try {
        const NOTES_PER_PAGE = 2;
        const currentPage = req.query.page;
        const totalDocuments = await Notes.find().countDocuments();
        const totalPages = Math.ceil(totalDocuments/NOTES_PER_PAGE);
        const notes = await Notes.find({user_id : user_id}, {"_id": 0, __v: 0})
            .sort({createdAt: -1})
            .skip((currentPage-1)*NOTES_PER_PAGE)
            .limit(NOTES_PER_PAGE)
        if (!notes) {
            const error = new Error ('Notes not found');
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json({
            message: 'Notes retrieved', 
            notes: notes, 
            currentPage: currentPage, 
            totalDocuments: totalDocuments,
            totalPages: totalPages
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postNotes = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        if(user_id.toString() !== req.user_id){
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error; 
        }
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
        const notes = new Notes({title: title, desciption: description, tags: tags, filesUrl: filesUrl, user_id: req.user_id});
        const savedNotes = await notes.save();
        if(!savedNotes) {
            throw new Error();
        }
        res.status(201).json({message: "File uploaded successfully", notes: savedNotes, creator: req.user_id});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.editPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
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
        const notes_id = req.params.notes_id;
        // only user who created the notes can update them
        const notes = await Notes.findOne({_id: notes_id});
        if(req.user_id !== notes.user_id.toString()) {
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }
        const title = req.body.title;
        const description = req.body.description;
        let filesUrl = req.body.files;
        const files = req.file.path;
        if(files){
            const cloudFile = await uploadHelper.fileUpload(files);
            filesUrl = cloudFile.secure_url;
        }
        if(!filesUrl){
            const error = new Error('No file provided');
            error.statusCode = 422;
            throw error;
        }
        notes.title = title;
        notes.description = description;
        notes.tags = tags;
        let updatedNotes = await notes.save();
        if (!updatedNotes) {
            throw err;
        }
        return res.status(200).json({message: 'Notes file updated successfully', user_id: notes.user_id.toString(), notes: updatedNotes});
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    const notes_id = req.params.notes_id;
    const notes = await Notes.findOne({_id: notes_id});
    if(!notes) {
        const error = new Error('Notes not found')
        error.statusCode = 404;
        throw error;
    }
    if(req.user_id !== notes.user_id.toString()) {
        const error = new Error('Not authorized to perform this action')
        error.statusCode = 403;
        throw error;
    }
    const result = await Notes.findByIdAndDelete({_id: notes_id});
    if (!result){
        throw err;
    }
    res.status(200).json({message: "Notes deleted successfully", notes: result});
};