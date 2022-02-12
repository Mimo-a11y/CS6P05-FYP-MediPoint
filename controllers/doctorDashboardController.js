const db = require('../models');


// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;
const HealthLog = db.Health_Log;
const OpdCard = db.Patient_OPD;
const DoctorOPD = db.Doctor_OPD;

//get OPD card for incoming appointments for doctors

const getTodaysOPDcard = async (req,res) => {
    try{
        // extracting the patient opd card
        const opdCard = await HealthLog.findAll({
            where:{Visit_Date: new Date().toISOString().slice(0, 10)},
            attributes: ['Card_No', 'Visit_No', 'Visit_Date'],
            include:[
                {
                    model: Patient
                },
                {
                    model: Doctor,
                    attributes:['D_ID'],
                    where:{D_ID: req.params.did }
                }
            ]
         });
         if(opdCard.length === 0){
            return res.status(200).render('incomingVisit', {mesg2: true});
         }else{
         return res.status(200).render('incomingVisit', {mesg1: opdCard});
         }
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}

//-------------------------------------------------------------------------------//

// get the patient's OPD card
const getPatientOpdCard = async (req,res) => {
    try{
        //retrieving patient details
        const patient = await Patient.findAll({ 
            where:{ P_ID: req.params.pid },
            include:[
                {
                    model: User,
                    attributes:['Full_Name']
                }
            ]
        });

        //retrieving doctor details
        const doctor = await Doctor.findAll({
            where: {D_ID: req.params.did},
            include:[{model: User, attributes: ['Full_Name']}]
        });

         //retrieving appointment details
         const appointments = await Patient.findOne({
            attributes:['P_ID'],
            where: {P_ID: req.params.pid},
            include:[
                {
                    model: AppointmentDetails,
                    where: {App_Date: new Date().toISOString().slice(0, 10)},
                }
            ]
        });

        // extracting the patient opd card
        const getopdCard = await HealthLog.findAll({
            attributes:['Card_No','Visit_No', 'Visit_Date'],
            include:[
                {
                    model: Patient,
                    where:{P_ID: req.params.pid}
                },{
                    model: Doctor,
                    where:{D_ID: req.params.did }
                }
            ]
         });
         var cardNumber = [];
         cardNumber[0] = {Card_No: getopdCard[0].Card_No, D_ID: req.params.did, P_ID: req.params.pid, App_Type: appointments.Patient_Appointment_Details[0].App_Type};
         return res.status(200).render('OPDcardDetails', {mesg1: patient, mesg2: doctor, mesg4: getopdCard, mesg3:appointments, mesg5: cardNumber});

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}
//-----------------------------------------------------------------------------------------------------------//

//get indiviual visit detail
const getVisitDetails = async (req,res) => {
    try{
        const healthLog = await HealthLog.findOne({
            where: {Card_No: req.params.cardno, Visit_No:req.params.visitno}
        });
        return res.json(healthLog);

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}

//exporting
module.exports = {
    getTodaysOPDcard,
    getPatientOpdCard,
    getVisitDetails
}