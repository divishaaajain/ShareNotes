const Sequelize = require('sequelize');

const sequelize = new Sequelize(`${process.env.DB_DATABASE}`, "root", `${process.env.DB_PASSWORD}`, {
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