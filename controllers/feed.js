const Notes = require('../models/notes');

const NOTES_PER_PAGE = 2;

exports.getNotes = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        if(user_id.toString() !== req.user_id){
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error; 
        }
        const currentPage = req.query.page || 1;
        const totalDocuments = await Notes.find().countDocuments();
        const totalPages = Math.ceil(totalDocuments/NOTES_PER_PAGE);
        const notes = await Notes.find()
            .populate('user_id', 'username, imageUrl')
            .sort({createdAt: -1})
            .skip((currentPage-1)*NOTES_PER_PAGE)
            .limit(NOTES_PER_PAGE);
        res.status(notes.length === 0 ? 404: 200).json({
            message: (notes.length === 0) ? 'No notes' :'Notes retrieved', 
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
            .populate('user_id', 'username, imageUrl')
            .sort({createdAt: -1})
            .skip((currentPage-1)*NOTES_PER_PAGE)
            .limit(NOTES_PER_PAGE);
        res.status(notes.length === 0 ? 404: 200).json({
            message: (notes.length === 0) ? 'No notes' :'Notes retrieved', 
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