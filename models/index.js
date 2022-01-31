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
//creating users and doctors tables
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

//creating patient table
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

//creating patient symptoms details table
db.Patient_Symptoms_Detail = require('./patientSymptomsDetail') (sequelize,DataTypes);
db.Patient_Symptoms = require('./patientSymptoms') (sequelize,DataTypes);

//association between patient and patient symptoms details table
db.patients.belongsToMany(db.Patient_Symptoms_Detail, {
    through:{
        model: db.Patient_Symptoms
    }
})

db.Patient_Symptoms_Detail.belongsToMany(db.patients, {
    through:{
        model: db.Patient_Symptoms
    }
})

//creating patient appointment details table
db.Patient_Appointment_Detail = require('./patientAppointmentDetails') (sequelize,DataTypes);
db.Patient_Appointments = require('./patientAppointment') (sequelize,DataTypes);

//association between patient and patient appointment details table
db.patients.belongsToMany(db.Patient_Appointment_Detail, {
    through:{
        model: db.Patient_Appointments
    }
})

db.Patient_Appointment_Detail.belongsToMany(db.patients, {
    through:{
        model: db.Patient_Appointments
    }
})


//syncing the sequelize i.e. creating tables
db.sequelize.sync({force: false})
.then(() => {
    console.log("Tables created");
})
.catch((err) => {
    console.log(err);
});

module.exports = db;