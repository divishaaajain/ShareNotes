const Sequelize = require('sequelize');

const sequelize = new Sequelize(`${process.env.MYSQL_DATABASE}`, `${process.env.MYSQL_USERNAME}`, `${process.env.MYSQL_PASSWORD}`, {
    dialect: "mysql",
    host: "0.0.0.0",
    port: `${process.env.MYSQL_PORT}`
});

sequelize.authenticate()
.then((result) => {
    console.log("connected to mysql");
})
.catch((err) => {
    throw new Error('Failed to connect to mysql');
});

module.exports = sequelize;