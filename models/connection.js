const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Connection = sequelize.define('connection');

module.exports = Connection;