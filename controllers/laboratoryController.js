const db = require('../models');
const { Op } = require("sequelize");
const { json } = require('body-parser');
let nodemailer = require('nodemailer');



// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;
const HealthLog = db.Health_Log;
const OpdCard = db.Patient_OPD;
const DoctorOPD = db.Doctor_OPD;
const LabReports = db.Lab_Reports;

//get the incoming lab tests 
const getLabTests = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
    const labReports = await LabReports.findAll({
         where: { Test_Done: 'No', 
        Test_Pay_Status: 'Paid', 
        [Op.not]: [
            {
              Test_Name: {
                [Op.like]: 'N/A'
              }
            }
        ]},
        attributes: [ 'Report_ID', 'Test_No', 'Test_Name', 'Test_Pay_Status', 'Test_Done'],
        include: [{
            model: HealthLog,
            attributes:['Card_No', 'Visit_No', 'LabReportReportID'],
            include:[{
                model: Patient,
                attributes:['P_ID'],
                include: [{
                    model: User,
                    attributes: ['Full_Name']
                }]
            },
            {
                model: Doctor,
                attributes: ['D_ID'],
                include: [{
                    model: User,
                    attributes: ['Full_Name']
                }]
            }
        ]
        }]
    }).catch((err) => {console.log(err)});
    if(labReports.length === 0){
        return res.status(200).render('laboratoryDashboard', {mesg1: true});
    }else{
        return res.status(200).render('laboratoryDashboard', {mesg2: labReports});
        //return res.json(labReports);
    }
}catch(e){
    console.log(e);
    return res.status(404).render('errorPage', {error: true});
}
}
//---------------------------------------------------------------------------------------------//

//get lab test details and upload reports form
const LabTestsDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
        const report = await LabReports.findOne({
            where: {Report_ID: req.params.reportid, Test_No: req.params.testno, Test_Done: 'No'},
            include:[
            {
                model: HealthLog,
                attributes: ['Card_No'],
                include:[{
                    model: Patient,
                    attributes:['P_ID', 'Age', 'Gender'],
                    include:[{
                    model: User,
                    attributes:['Full_Name']   
                    }]
                }]
            }]
        });
        if(report.length === 0){
            return res.status(200).render('uploadLabReports', {mesg2: true});
        }else{
       return res.status(200).render('uploadLabReports', {mesg1: report});
        }


    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//----------------------------------------------------------------------------------------//

// upload lab tests reports
const uploadReports = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
        const file = req.files.file;
        const filename = new Date().getTime() +'_'+file.name;
        file.mv('./uploads/'+filename, async (err) => {
                if(err){
                    console.log(err);
                    return res.status(404).render('errorPage', {error: true});
                }else{
                    await LabReports.update(
                        {Test_Done: 'Yes', File_Data: filename},
                        {where: {Report_ID: req.params.reportid, Test_No: req.params.testno}}
                    ).catch((err) => {console.log(err)});

                    const patient = await Patient.findOne({
                        attributes:['P_ID'],
                        where: {P_ID: req.params.pid},
                        include:[{
                            model: User,
                            attributes:['Full_Name', 'Email']
                        }]
                    });
                    const labTest = await LabReports.findOne({
                        attributes:['Test_No', 'Test_Name'],
                        where: {Report_ID: req.params.reportid, Test_No: req.params.testno}
                    });
                     // e-mail message options
  let mailOptions = {
    from: 'kmimo7na@gmail.com',
    to: patient.User.Email,
    subject: 'Lab test completed',
    text: `Hello ${patient.User.Full_Name}, the reports for ${labTest.Test_Name} has been published. Please login into your account to view your reports.`
};

// e-mail transport configuration
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kmimo7na@gmail.com',
      pass: 'hjongizomfmjrlik'
    }
});

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
});
                    return res.redirect('/dashboard/Laboratory/incomingLabTests');
                }
        })
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}

//exporting
module.exports= {
    getLabTests,
    LabTestsDetails,
    uploadReports

}