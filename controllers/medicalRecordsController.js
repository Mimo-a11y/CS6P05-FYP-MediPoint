const db = require('../models');
const path = require('path');

// create main model
const Doctor = db.doctors;
const User = db.users;
const Patient = db.patients;
const HealthLog = db.Health_Log;
const LabReports = db.Lab_Reports;
const Prescriptions = db.Prescriptions;

//get the medical records page
const getmedicalRecordsPage = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        const patientID = await Patient.findAll({
            attributes: ['P_ID'],
            include: [{
                model: User,
                where: {
                    U_ID: req.user.U_ID
                }
            }]
        });

        const opdCards = await HealthLog.findAll({
            attributes: ['Card_No', 'Visit_Date'],
            where: {
                Visit_No: 1
            },
            include: [{
                    model: Patient,
                    attributes: ['P_ID'],
                    where: {
                        P_ID: patientID[0].P_ID
                    },
                    include: [{
                        model: User,
                        attributes: ['Full_Name']
                    }]

                },
                {
                    model: Doctor,
                    attributes: ['D_ID', 'Dept_Name'],
                    include: [{
                        model: User,
                        attributes: ['Full_Name']
                    }]
                }
            ]
        });
        if (opdCards.length === 0) {
            return res.status(200).render('patientOPDHistory', {
                mesg1: true
            });
        } else {
            return res.status(200).render('patientOPDHistory', {
                mesg2: opdCards
            });
        }
        //res.json(opdCards);
        //res.json(patientID[0].P_ID);

    } catch (e) {
        console.log(e);
        return res.status(400).render('errorPage', {
            error: true
        });
    }
}
//---------------------------------------------------------------------------//

// get the patient's OPD card
const getPatientsOpdCard = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        //retrieving patient details
        const patient = await Patient.findAll({
            where: {
                P_ID: req.params.pid
            },
            include: [{
                model: User,
                attributes: ['Full_Name']
            }]
        });

        //retrieving doctor details
        const doctor = await Doctor.findAll({
            where: {
                D_ID: req.params.did
            },
            include: [{
                model: User,
                attributes: ['Full_Name']
            }]
        });

        // extracting the patient opd card
        const getopdCard = await HealthLog.findAll({
            attributes: ['Card_No', 'Visit_No', 'Visit_Date'],
            include: [{
                model: Patient,
                where: {
                    P_ID: req.params.pid
                }
            }, {
                model: Doctor,
                where: {
                    D_ID: req.params.did
                }
            }]
        });
        var cardNumber = [];
        cardNumber[0] = {
            Card_No: getopdCard[0].Card_No,
            D_ID: req.params.did,
            P_ID: req.params.pid
        };
        return res.status(200).render('OPDcardDetails', {
            mesg1: patient,
            mesg2: doctor,
            mesg6: getopdCard,
            mesg5: cardNumber
        });

    } catch (e) {
        console.log(e);
        return res.status(404).render('errorPage', {
            error: true
        });
    }
}
//----------------------------------------------------------------------------------//

//get indiviual visit detail
const getPatientVisitDetails = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        const healthLog = await HealthLog.findOne({
            where: {
                Card_No: req.params.cardno,
                Visit_No: req.params.visitno
            },
        });

        const labReports = await LabReports.findAll({
            where: {
                Report_ID: healthLog.LabReportReportID
            },
        });
        const medicines = await Prescriptions.findAll({
            where: {
                Pres_ID: healthLog.PrescriptionPresID
            },
        });
        if (healthLog.BP === null && healthLog.Pulse === null && healthLog.Temperature === null && healthLog.Symptoms_Exp === null && healthLog.Diagnosis === null && healthLog.LabReportReportID === null && healthLog.PrescriptionPresID === null) {
            return res.render('patientVisitDetails', {
                mesg7: true
            });
        } else {
            return res.render('patientVisitDetails', {
                mesg2: healthLog,
                mesg6: labReports,
                mesg4: medicines,
                mesg5: true
            });
        }


    } catch (e) {
        console.log(e);
        return res.status(404).render('errorPage', {
            error: true
        });
    }
}
//----------------------------------------------------------------------------------------//

//download lab reports
const downloadPatientLabReports = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        var file = req.params.file;
        var fileLocation = path.join('./uploads', file);
        return res.download(fileLocation, file, (err) => {
            if (err) {
                return res.status(400).render('errorPage', {
                    error: true
                });
            }
        })
    } catch (e) {
        console.log(e);
        return res.status(404).render('errorPage', {
            error: true
        });
    }
};


//exporting
module.exports = {
    getmedicalRecordsPage,
    getPatientsOpdCard,
    getPatientVisitDetails,
    downloadPatientLabReports
}