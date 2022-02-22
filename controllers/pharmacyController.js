const db = require('../models');
const { Op } = require("sequelize");


// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;
const HealthLog = db.Health_Log;
const OpdCard = db.Patient_OPD;
const DoctorOPD = db.Doctor_OPD;
const Prescription = db.Prescriptions;

//get the pharmacy dashboard page
const getPharmacyDashboardPage = async (req,res) => {
    try{
        const patient = await Patient.findAll({
            attributes: ['P_ID'],
            include: [{
                model: User,
                attributes:['Full_Name']
            },{
                model: HealthLog,
                attributes:['Card_No', 'Visit_No', 'PrescriptionPresID'],
                where: {Visit_Date: new Date().toISOString().slice(0, 10)},
                include:[{
                    model: Prescription,
                    where:{
                        Pres_No: 1,
                        [Op.not]: [
                            {
                              Medicine_Name: {
                                [Op.like]: 'N/A'
                              }
                            }
                          ]
                    },
                    attributes:['Pres_ID', 'Pres_No', 'Medicine_Name']
                },{
                    model: Doctor,
                    attributes: ['D_ID'],
                    include: [{
                        model: User,
                        attributes: ['Full_Name']
                    }]
                }]
            }]
        }).catch((err) => {console.log(err)});
        if(patient.length === 0){
            return res.status(200).render('pharmacyDashboard', {mesg1: true});
        }else{
            return res.status(200).render('pharmacyDashboard', {mesg2: patient});
        }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}
//-----------------------------------------------------------------------------//

//get prescriptions details
const getPresDetails = async (req,res) => {
    try{
        let medicines = await Prescription.findAll({
            where: {Pres_ID: req.params.presid, Med_Pay_Status: 'Unpaid', Received: 'N/A'},
            attributes: ['Pres_ID', 'Medicine_Name', 'Pres_No', 'Med_Pay_Status', 'Description', 'Duration', 'Days']
        });
        if(medicines.length === 0){
            return res.status(200).render('pharmacyDashboard', {mesg4:true});
        }else{
            return res.status(200).render('pharmacyDashboard', {mesg3: medicines});
        }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}
//------------------------------------------------------------------------------------------------//

//confirm medicine payment
const confirmPrescriptionsDetails = async (req,res) => {
    try{
        await Prescription.update(
            {Med_Pay_Status: "Paid", Received: 'Yes'},
            {where: {Pres_ID: req.params.presid, Pres_No: req.params.presno}}
        );
        return res.redirect(req.get('referer'));

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}
//---------------------------------------------------------------------------------------//

//confirm lab test payment
const cancelPrescriptionsDetails = async (req,res) => {
    try{
        await Prescription.update(
            {Received: 'No'},
            {where: {Pres_ID: req.params.presid, Pres_No: req.params.presno}}
        );
        return res.redirect(req.get('referer'));

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}
//---------------------------------------------------------------------------//

//get confirmed prescriptions
const getConfirmedPrescriptions = async (req,res) => {
    try{
        const patient = await Patient.findAll({
            attributes: ['P_ID'],
            include: [{
                model: User,
                attributes:['Full_Name']
            },{
                model: HealthLog,
                attributes:['Card_No', 'Visit_No', 'PrescriptionPresID'],
                where: {Visit_Date: new Date().toISOString().slice(0, 10)},
                include:[{
                    model: Prescription,
                    where:{
                        Pres_No: 1,
                        Med_Pay_Status: 'Paid',
                        Received: 'Yes',
                        [Op.not]: [
                            {
                              Medicine_Name: {
                                [Op.like]: 'N/A'
                              }
                            }
                          ]
                    },
                    attributes:['Pres_ID', 'Pres_No', 'Medicine_Name', 'Med_Pay_Status', 'Received']
                },{
                    model: Doctor,
                    attributes: ['D_ID'],
                    include: [{
                        model: User,
                        attributes: ['Full_Name']
                    }]
                }]
            }]
        }).catch((err) => {console.log(err)});
        if(patient.length === 0){
            return res.status(200).render('pharmacyDashboard', {mesg5: true});
        }else{
            return res.status(200).render('pharmacyDashboard', {mesg6: patient});
        }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}


//exporting
module.exports = {
    getPharmacyDashboardPage,
    getPresDetails,
    confirmPrescriptionsDetails,
    cancelPrescriptionsDetails,
    getConfirmedPrescriptions
}