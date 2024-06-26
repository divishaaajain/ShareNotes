const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const multer = require('multer');
const sequelize = require('./util/database');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const feedRoutes = require('./routes/feed');
const User = require('./models/user');
const Connection = require('./models/connection');

const app = express();

const uploader = multer({storage: multer.diskStorage({})});    // empty - we can get the file but we are not storing is on the disk storage

app.use(bodyParser.json());
app.use('/auth', uploader.single('image'));
app.use('/profile', uploader.single('files'));

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/feed', feedRoutes);

User.belongsToMany(User, {                                            // Self-join
    as: 'followers',
    through: {
        model: Connection,      // Name of the join table
        unique: true,           // Ensure unique combinations of followedTo and followedBy
        primaryKey: true 
    },
    foreignKey: 'followedTo',
    otherKey: 'followedBy'
});
User.belongsToMany(User, {
    as: 'following',
    through: {
        model: Connection,      // Name of the join table
        unique: true,           // Ensure unique combinations of followedTo and followedBy
        primaryKey: true 
    },
    foreignKey: 'followedBy',
    otherKey: 'followedTo'
});

app.use((error, req, res, next) => {
    const status = error.statusCode;
    const message = error.message;
    const data = error.data
    res.status(status).json({message: message, data: data});
});

Promise.all([
    sequelize.sync(),                                             // // {force: true}
    mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster1.digrd5x.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority&appName=Cluster1`)
])            
.then((connection) => {
    if (connection) {
        const httpServer = app.listen(process.env.PORT || 3000);
        const io = require('./socket').init(httpServer);
        io.on('connection', (socket) => {
            console.log("connected to client");
        });
    }
})
.catch((err)=>{
    process.exit();
});
