const Notes = require('../models/notes');
const User = require('../models/user');

const NOTES_PER_PAGE = 2;

exports.getNotes = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        if(user_id.toString() !== req.user_id){
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error; 
        }
        const user = await User.findByPk(user_id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const followedTo_users = await user.getFollowing();
        let user_ids = followedTo_users.map((user) => {
            return user.user_id.toString();
        });
        user_ids.push(user_id);
        const currentPage = req.query.page || 1;
        const notes = await Notes.find({user_id: {$in: user_ids}})
            .populate('user_id', 'username, imageUrl')
            .sort({createdAt: -1})
            .skip((currentPage-1)*NOTES_PER_PAGE)
            .limit(NOTES_PER_PAGE);
        const totalDocuments = notes.length;
        const totalPages = Math.ceil(totalDocuments/NOTES_PER_PAGE);
        res.status(totalDocuments === 0 ? 404: 200).json({
            message: (totalDocuments === 0) ? 'No notes' :'Notes retrieved', 
            notes: notes,
            currentPage: (totalDocuments === 0) ? 0 : currentPage, 
            totalRecords: totalDocuments,
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
        const user_id = req.params.user_id;
        if(user_id.toString() !== req.user_id){
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error; 
        }
        const user = await User.findByPk(user_id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const followedTo_users = await user.getFollowing()
        let user_ids = followedTo_users.map((user) => {
            return user.user_id.toString();
        });
        // user_ids.push(user_id);
        const currentPage = req.query.page || 1;
        const tags = req.body.tags;
        const notes = await Notes.find({user_id: {$in: user_ids}, tags: {$in: tags}})
            .populate('user_id', 'username, imageUrl')
            .sort({createdAt: -1})
            .skip((currentPage-1)*NOTES_PER_PAGE)
            .limit(NOTES_PER_PAGE);
        const totalDocuments = notes.length;
        const totalPages = Math.ceil(totalDocuments/NOTES_PER_PAGE);
        res.status(totalDocuments === 0 ? 404: 200).json({
            message: (totalDocuments === 0) ? 'No notes' :'Notes retrieved', 
            notes: notes,
            currentPage: (totalDocuments === 0) ? 0 : currentPage, 
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