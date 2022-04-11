const db = require('../models');
const Patient = db.patients;
const AppointmentDetails = db.Patient_Appointment_Detail;
const sequelize =  require('sequelize');
const HealthLog = db.Health_Log;

let getPatientAgeData = async (req,res) => {
    const getAgeCount = await Patient.findAll({
        attributes: ['Age', [sequelize.fn('count', sequelize.col('P_ID')), 'count']],
        group : ['Patient.Age'],
        raw: true,
        order: sequelize.literal('count DESC')
    });
    console.log(getAgeCount);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getAgeCount));
}

let getPatientGenderData = async (req,res) => {
    const getGenderCount = await Patient.findAll({
        attributes: ['Gender', [sequelize.fn('count', sequelize.col('P_ID')), 'count']],
        group : ['Patient.Gender'],
        raw: true,
    });
    console.log(getGenderCount);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getGenderCount));
}

let getAppData = async (req,res) => {
    const getAppCount = await Patient.findAll({
        attributes: ['P_ID', [sequelize.fn('count', sequelize.col('P_ID')), 'count']],
        raw: true,
    }).catch((err) => {console.log(err)});
    console.log(getAppCount);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getAppCount));
}

module.exports = {
    getPatientAgeData,
    getPatientGenderData,
    getAppData
}