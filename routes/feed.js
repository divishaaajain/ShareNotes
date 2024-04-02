const express = require('express');

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/is-auth');


const router = express.Router();

// To get all notes of all users
router.get('/', isAuth, feedController.getNotes);

router.post('/search-notes', isAuth, feedController.searchNotes);

module.exports = router;