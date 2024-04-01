const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const multer = require('multer');

const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed');


const app = express();

const uploader = multer({storage: multer.diskStorage({})});    // empty - we can get the file but we are not storing is on the disk storage

app.use(bodyParser.json());
app.use('/auth', uploader.single('image'));
app.use('/feed', uploader.single('files'));

app.use('/auth', authRoutes);
app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode;
    const message = error.message;
    const data = error.data
    res.status(status).json({message: message, data: data});
});

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster1.digrd5x.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority&appName=Cluster1`)
.then((connection) => {
    app.listen(process.env.PORT || 3000);
})
.catch((err)=>{
    console.log(err);
})
