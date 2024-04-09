const Sequelize = require('sequelize');

const sequelize = new Sequelize("share_notes", "root", "Divisha@123", {
    dialect: "mysql",
    host: "localhost"
});

sequelize.authenticate()
.then((result) => {
    console.log("connected to mysql");
})
.catch((err) => {
    throw new Error('Failed to connect to mysql');
});

module.exports = sequelize;