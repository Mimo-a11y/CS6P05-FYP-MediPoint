const db = require('../models');


// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;
const HealthLog = db.Health_Log;
const OpdCard = db.Patient_OPD;
const DoctorOPD = db.Doctor_OPD;
const LabReports = db.Lab_Reports;
const Prescriptions = db.Prescriptions;

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
            where: {Card_No: req.params.cardno, Visit_No:req.params.visitno},
        });

        const labReports = await LabReports.findAll({
            where: {Report_ID: healthLog.LabReportReportID},
        }); 
        const medicines = await Prescriptions.findAll({
            where: {Pres_ID: healthLog.PrescriptionPresID},
        }); 
        if(healthLog.BP === null && healthLog.Pulse === null && healthLog.Temperature === null && healthLog.Symptoms_Exp === null && healthLog.Diagnosis === null && healthLog.LabReportReportID === null && healthLog.PrescriptionPresID === null){
            return res.render('patientVisitDetails', {mesg1: healthLog});
        }else{
            return res.render('patientVisitDetails', {mesg2: healthLog, mesg3: labReports, mesg4: medicines});
        }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}

//update details on each patient visit
const updateVisitDetails = async (req,res) => {
    try{
        //LAB TESTS RECORD
        let payStatusData = {
            Test_Done: "No",
            Test_No:  1,
            Test_Name: req.body['1']
        }
        let reportID = await LabReports.create(payStatusData).then(result => {return result.Report_ID});
        Object.keys(req.body).forEach(async function(key){
            let intKey = parseInt(key);
            if( intKey < 20 && intKey !== NaN && intKey !== 1 ){
                let testData = {
                    Report_ID: reportID,
                    Test_No: key,
                    Test_Name: req.body[key]
                }
                let labReports = await LabReports.create(testData);
            }
             })

        //PRESCRIPTIONS RECORD
        if(req.body.medName instanceof Array){
        let medicineData ={
            Pres_No: 1,
            Medicine_Name: req.body.medName[0],
            Description: req.body.desc[0],
            Days: req.body.days[0],
            Duration: req.body.duration[0],
            Received: 'No'
        }
        let presID = await Prescriptions.create(medicineData).then(result => {return result.Pres_ID});
        for(var i=1; i< req.body.medName.length; i++){
            let medicineData ={
                Pres_ID: presID,
                Pres_No: i + 1,
                Medicine_Name: req.body.medName[i],
                Description: req.body.desc[i],
                Days: req.body.days[i],
                Duration: req.body.duration[i],
                Received: 'No'
            }
            await Prescriptions.create(medicineData);
        }
        await HealthLog.update(
            {PrescriptionPresID: presID},
            {where: {Card_No: req.params.cardno, Visit_No:req.params.visitno}}
        );
    }else{
        let medicineData ={
            Pres_No: 1,
            Medicine_Name: req.body.medName,
            Description: req.body.desc,
            Days: req.body.days,
            Duration: req.body.duration,
            Received: 'No'
        }
        let presID = await Prescriptions.create(medicineData).then(result => {return result.Pres_ID});
        await HealthLog.update(
            {PrescriptionPresID: presID},
            {where: {Card_No: req.params.cardno, Visit_No:req.params.visitno}}
        );
    }
        //UPDATE THE OPD CARD
        await HealthLog.update(
            {
            BP: req.body.bp,
            Pulse: req.body.pulse,
            Temperature: req.body.temp,
            Symptoms_Exp: req.body.sympExp,
            Diagnosis: req.body.diagnosis,
            LabReportReportID: reportID},
            {where: {Card_No: req.params.cardno, Visit_No:req.params.visitno}}
        );
        console.log(req.body);
        return res.redirect(req.get('referer'));

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}

//exporting
module.exports = {
    getTodaysOPDcard,
    getPatientOpdCard,
    getVisitDetails,
    updateVisitDetails
}