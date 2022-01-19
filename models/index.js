const dbconfig = require('../config/dbconfig');
const {Sequelize, DataTypes} = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(dbconfig.DATABASE, dbconfig.USER, dbconfig.PASSWORD, {
    host: dbconfig.HOST,
    dialect: dbconfig.dialect,
    pool: {
        min: dbconfig.pool.min,
        max: dbconfig.pool.max,
        acquire: dbconfig.pool.acquire,
        idle: dbconfig.pool.idle
    }
});

//authenticating sequelize
sequelize.authenticate()
.then(() => {
    console.log("connected");
})
.catch((err) => {
    console.log(err);
}) 

//creating a database
const db = {}
db.Sequelize =Sequelize
db.sequelize = sequelize
//creating tables
db.users = require('./users') (sequelize,DataTypes);
db.doctors = require('./doctors') (sequelize,DataTypes);
db.users.hasOne(db.doctors);
db.doctors.belongsTo(db.users);

//syncing the sequelize i.e. creating tables
db.sequelize.sync({force: false})
.then(() => {
    console.log("Tables created");
})
.catch((err) => {
    console.log(err);
});

module.exports = db;