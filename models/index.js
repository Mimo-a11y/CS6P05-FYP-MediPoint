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
//association between users and doctors table
db.doctors.belongsTo(db.users,{
    foreignKey: {
        allowNull: false,
        unique: true,
    },
     onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
db.patients = require('./patients') (sequelize, DataTypes);

//association between users and patient table
db.patients.belongsTo(db.users,{
    foreignKey: {
        allowNull: true,
        unique: true,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


//syncing the sequelize i.e. creating tables
db.sequelize.sync({force: false})
.then(() => {
    console.log("Tables created");
})
.catch((err) => {
    console.log(err);
});

module.exports = db;