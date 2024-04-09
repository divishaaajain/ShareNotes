const {validationResult} = require('express-validator');

const Notes = require('../models/notes');
const User = require('../models/user');
const uploadHelper = require('../helpers/upload');
const io = require('../socket');


exports.getNotes = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        // Find the user(req.params.user_id) and check if followedByUser(who has requested) is following
        const user = await User.findByPk(user_id, { include: [{ model: User, as: 'followers', where: {User_id: req.user_id} }] });

        if((user_id.toString() === req.user_id.toString()) || (user && user.followers[0].user_id.toString() === req.user_id)) {
            const NOTES_PER_PAGE = 2;
            const currentPage = req.query.page || 1;
            const notes = await Notes.find({user_id : user_id})
                .sort({createdAt: -1})
                .skip((currentPage-1)*NOTES_PER_PAGE)
                .limit(NOTES_PER_PAGE)
            const totalDocuments = notes.length;
            const totalPages = Math.ceil(totalDocuments/NOTES_PER_PAGE);
            return res.status(totalDocuments === 0 ? 404: 200).json({
                message: (totalDocuments === 0) ? 'No notes' :'Notes retrieved', 
                notes: notes, 
                currentPage: (totalDocuments === 0) ? 0 : currentPage, 
                totalDocuments: totalDocuments,
                totalPages: totalPages
            });
        } else {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getSingleNotes = async (req, res, next) => {
    try {
        const notes_id = req.params.notes_id;

        // Find the user(req.params.user_id) and check if followedByUser(who has requested) is following
        const user = await User.findByPk(user_id, { include: [{ model: User, as: 'followers', where: {User_id: req.user_id} }] });

        if((user_id.toString() === req.user_id.toString()) || (user && user.followers[0].user_id.toString() === req.user_id)) {
            const notes = await Notes.findOne({_id: notes_id});
            return res.status(notes.length === 0 ? 404 : 200).json({
                message: (notes.length === 0) ? 'Notes not found' : 'Notes retrieved',
                notes: notes
            });
        } else {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
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
            error.statusCode = 401;
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
        const files = req.file;
        if(!files){
            const error = new Error('No file provided');
            error.statusCode = 422;
            throw error;
        }
        const cloudFile = await uploadHelper.fileUpload(files.path);
        const url = cloudFile.secure_url;
        const public_id = cloudFile.public_id;
        const title = req.body.title;
        const description = req.body.description;
        const notes = new Notes({
            title: title, 
            desciption: description, 
            tags: tags, 
            files: {
                url: url,
                public_id: public_id
            },
            user_id: user_id
        });
        const savedNotes = await notes.save();
        if(!savedNotes) {
            throw new Error();
        }
        io.getIO().emit('notes', {
            action: 'create', 
            notes: savedNotes
        });
        res.status(201).json({
            message: "File uploaded successfully", 
            notes: savedNotes, 
            creator: req.user_id
        });
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
        const notes_id = req.params.notes_id;
        // only user who created the notes can update them
        const notes = await Notes.findOne({_id: notes_id});
        if(req.user_id !== notes.user_id.toString()) {
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }
        const tags = req.body.tags;
        const title = req.body.title;
        const description = req.body.description;
        let files;
        const newFiles = req.file;
        if(newFiles){
            const cloudFile = await uploadHelper.fileUpload(newFiles.path);
            files = {
                url: cloudFile.secure_url,
                public_id: cloudFile.public_id
            }
        } else {
            files = notes.files;
        }
        if(!files){
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
        io.getIO().emit('notes', {
            action: 'update', 
            notes: updatedNotes
        });
        return res.status(200).json({
            message: 'Notes file updated successfully', 
            user_id: notes.user_id.toString(), 
            notes: updatedNotes
        });
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
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
        // const files = "folder/sample/"+notes.files[0].public_id+".pdf";
        // console.log("1",files)
        const result = await Notes.findByIdAndDelete({_id: notes_id});
        if (!result){
            throw err;
        }
        // const deleteResult = await uploadHelper.deleteFile(files);
        // console.log(deleteResult);
        io.getIO().emit('notes', {
            action: 'delete', 
            notes: result
        });
        res.status(200).json({
            message: "Notes deleted successfully", 
            notes: result
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            next(err);
        }
    }
};

exports.follow = async (req, res, next) => {
    try {
        const followedTo_id = req.params.followedTo_id;
        const followedBy_id = req.user_id;
        const users = await User.findAll({where: {user_id: [followedTo_id, followedBy_id]}});
        if(users.length<2) {
            const error = new Error('User doesnot exist');
            error.statusCode = 404;
            throw error;
        }
        let followedBy, followedTo;
        users.forEach((user) => {
            console.log(user.user_id)
            if(user.user_id.toString() === followedTo_id){
                followedTo = user;
            } else {
                followedBy = user;
            }
        });
        const result = await followedTo.addFollower(followedBy);
        if (!result) {
            const error = new Error('Unable to follow. Please try again')
            throw error;
        }
        res.status(200).json({message: "User added to following", result: result[0]});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};