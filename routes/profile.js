const express = require('express');
const {body} = require('express-validator');

const profileController = require('../controllers/profile');
const isAuth = require('../middleware/is-auth');


const router = express.Router();

// User can get all his posts
router.get('/notes/:user_id', isAuth, profileController.getNotes);

// User can add a new post
router.post('/notes/:user_id', isAuth, [
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
], profileController.postNotes);

// User can update his post
router.put('/notes/:notes_id', isAuth, [
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
], profileController.editPost);

router.delete('/notes/:notes_id', isAuth, profileController.deletePost);

module.exports = router;