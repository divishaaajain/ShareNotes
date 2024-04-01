const express = require('express');
const {body} = require('express-validator');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');


const router = express.Router();

router.get('/notes', isAuth, feedController.getNotes);

router.post('/notes', isAuth, [
    body('title', 'Title must be between 3 to 30 characters')
        .trim()
        .isString()
        .isLength({min: 3, max: 100})
        .withMessage('Title must be between 3 to 30 characters')
        .not().isEmpty()
        .withMessage('Title not provided'),
    body('description', 'Description must be between 5 to 200 characters')
        .trim()
        .isString()
        .withMessage('Description must be between 5 to 200 characters')
        .isLength({min: 5, max:300})
        .not().isEmpty()
        .withMessage('Description not provided'),
    body('tags', 'Tags must start with # followed by only alphabets and/or numbers')
        .trim()
        .isArray()
        .custom((tags, {req}) => {
            const uniqueTags = new Set(tags);
            if (uniqueTags.size !== tags.length) {
                return Promise.reject('Tags must not be repeated');
            }
            return Promise.resolve();
        })
], feedController.postNotes);

module.exports = router;