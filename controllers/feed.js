const Notes = require('../models/notes');

const NOTES_PER_PAGE = 2;

exports.getNotes = async (req, res, next) => {
    try {
        const currentPage = req.query.page || 1;
        const totalDocuments = await Notes.find().countDocuments();
        const totalPages = Math.ceil(totalDocuments/NOTES_PER_PAGE);
        const notes = await Notes.find()
            .populate('userId', 'username, imageUrl')
            .sort({createdAt: -1})
            .skip((currentPage-1)*NOTES_PER_PAGE)
            .limit(NOTES_PER_PAGE);
        if (!notes.length>0) {
            const error = new Error('Not not found');
            error.statusCode = 404;
            throw err;
        }
        res.status(200).json({
            message: "Notes retrieved", 
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

exports.searchNotes = async (req, res, next) => {
    try {
        const currentPage = req.query.page || 1;
        const totalDocuments = await Notes.find().countDocuments();
        const totalPages = Math.ceil(totalDocuments/NOTES_PER_PAGE);
        const tags = req.body.tags;
        const notes = await Notes.find({tags: {$in: tags}})
            .populate('userId', 'username, imageUrl')
            .sort({createdAt: -1})
            .skip((currentPage-1)*NOTES_PER_PAGE)
            .limit(NOTES_PER_PAGE);
        if (!notes.length>0) {
            const error = new Error('Notes not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "Notes retrieved", 
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