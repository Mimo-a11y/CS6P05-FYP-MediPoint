const db = require('../models');

//creating main model
const Doctor = db.doctors;
const User = db.users;
const Patient = db.patients;
const PatientAppDetail = db.Patient_Appointment_Detail;
const PatientApp = db.Patient_Appointments;
const HealthLog = db.Health_Log;


//get the book appointment page

const getBookAppointmentPage = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        const userType = await User.findOne({
            attributes: ['User_Type'],
            where: {
                U_ID: req.user.U_ID
            }
        });
        if (userType.User_Type !== "Patient") {
            return res.status(400).render('errorPage');
        } else {
            return res.status(200).render('bookAppointment');
        }
    } catch (e) {
        console.log(e);
        return res.status(400).render('errorPage', {
            error: true
        });
    }

}
//--------------------------------------------------------------------//

//search doctors
const searchDoctors = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        const doctors = await Doctor.findAll({
            where: {
                Dept_Name: req.query.departments
            },
            include: User
        })
        if (doctors.length < 1) {
            return res.status(200).render('bookAppointment', {
                mesg1: true
            })
        } else {
            var doctorsObj = {}
            var doctorsArr = [];
            doctors.forEach((e) => {
                doctorsObj.id = e.dataValues.D_ID;
                doctorsObj.contact = e.dataValues.Contact;
                doctorsObj.address = e.dataValues.D_Address;
                doctorsObj.dept = e.dataValues.Dept_Name;
                doctorsObj.exp = e.dataValues.Years_of_Exp;
                doctorsObj.regNo = e.dataValues.NMC_No;
                doctorsObj.day = e.dataValues.Avl_Day;
                doctorsObj.time = e.dataValues.Avl_Time;
                doctorsObj.name = e.dataValues.User.Full_Name;
                const finalObj = {
                    ...doctorsObj
                };
                doctorsArr.push(finalObj);

            });
            return res.status(200).render('bookAppointment', {
                mesg2: doctorsArr
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(400).render('errorPage', {
            error: true
        });

    }
}
//------------------------------------------------------------------------------//

// get date chooser for appointment booking

const getDateChooser = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        const doctorDetails = await Doctor.findOne({
            attributes: ['Avl_Time', 'Avl_Day', 'D_ID'],
            where: {
                D_ID: req.params.id
            }
        });
        return res.status(200).render('fixAppointment', {
            mesg: doctorDetails
        });
    } catch (e) {
        console.log(e);
        return res.status(400).render('errorPage', {
            error: true
        });
    }
}

//------------------------------------------------------------------------//

//insert appointment data
const recordAppointment = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        const patientID = await Patient.findOne({
            attributes: ['P_ID'],
            where: {
                UserUID: req.user.U_ID
            }
        });
        //
        const appointments = await Patient.findAll({
            attributes: ['P_ID'],
            where: {
                P_ID: patientID.P_ID
            },
            include: [{
                model: PatientAppDetail
            }]
        });

        // checking if the opd card already exists
        const opdCardExists = await HealthLog.findAll({
            include: [{
                model: Patient,
                where: {
                    P_ID: patientID.P_ID
                }
            }, {
                model: Doctor,
                where: {
                    D_ID: req.params.id
                }
            }]
        });

        //
        var appObj = {};
        var appArr = new Array();
        var finalObj = {};
        var isFound = true;
        var cardExists = true;
        for (var e of appointments[0].Patient_Appointment_Details) {
            const doctors = await Doctor.findAll({
                where: {
                    D_ID: e.dataValues.Patient_Appointments.Doctor_ID
                },
                include: User
            })
            appObj.doctorID = e.dataValues.Patient_Appointments.Doctor_ID,
                appObj.deptName = doctors[0].dataValues.Dept_Name,
                appObj.docName = doctors[0].dataValues.User.Full_Name,
                appObj.id = e.dataValues.App_ID;
            appObj.date = e.dataValues.App_Date;
            appObj.time = e.dataValues.App_Time;
            appObj.type = e.dataValues.App_Type;
            appObj.pay = e.dataValues.Payment_Status;
            finalObj = {
                ...appObj
            };
            appArr.push(finalObj);
        };
        for (var element in appArr) {
            if (appArr[element].doctorID == req.params.id && appArr[element].date == req.body.appDate && appArr[element].time == req.body.appTime) { //restricting double bookings
                isFound = false;
                break;
            } else if (appArr[element].date == req.body.appDate) { //restricting one booking per day
                isFound = false;
                break;
            } else {
                isFound = true;
            }

        }
        if (opdCardExists.length > 0 && req.body.appType === 'New') {
            cardExists = true;

        } else if (opdCardExists.length === 0 && req.body.appType === 'Follow-Up') {
            cardExists = true;
        } else {
            cardExists = false;
        }
        if (isFound === true && cardExists === false) {
            let appointment = {
                App_Date: req.body.appDate,
                App_Time: req.body.appTime,
                App_Type: req.body.appType,
                Payment_Status: 'Unpaid'
            }
            let appID = await PatientAppDetail.create(appointment).then(result => {
                return result.App_ID
            });
            let pData = {
                PatientPID: patientID.P_ID,
                PatientAppointmentDetailAppID: appID,
                Doctor_ID: req.params.id
            }
            await PatientApp.create(pData); // inserting into Patient_Appointments table
            return res.status(200).render('bookingConfirmation', {
                mesg1: true
            });
        } else if (isFound === false && cardExists === true) {
            return res.status(200).render('bookingConfirmation', {
                mesg2: true
            });
        } else if (isFound === false && cardExists === false) {
            return res.status(200).render('bookingConfirmation', {
                mesg2: true
            });
        } else if (isFound === true && cardExists === true) {
            return res.status(200).render('bookingConfirmation', {
                mesg3: true
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(400).render('errorPage', {
            error: true
        });

    }
}

//----------------------------------------------------------------------------------------//

//upcoming appointments
const getUpcomingAppointments = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        const patientID = await Patient.findOne({
            attributes: ['P_ID'],
            where: {
                UserUID: req.user.U_ID
            }
        });
        const appointments = await Patient.findAll({
            attributes: ['P_ID'],
            where: {
                P_ID: patientID.P_ID
            },
            include: [{
                model: PatientAppDetail
            }]
        });
        var appObj = {};
        var appArr = new Array();
        var finalObj = {};
        for (var e of appointments[0].Patient_Appointment_Details) {
            const doctors = await Doctor.findAll({
                where: {
                    D_ID: e.dataValues.Patient_Appointments.Doctor_ID
                },
                include: User
            })
            appObj.doctorID = e.dataValues.Patient_Appointments.Doctor_ID,
                appObj.deptName = doctors[0].dataValues.Dept_Name,
                appObj.docName = doctors[0].dataValues.User.Full_Name,
                appObj.id = e.dataValues.App_ID;
            appObj.date = e.dataValues.App_Date;
            appObj.time = e.dataValues.App_Time;
            appObj.type = e.dataValues.App_Type;
            appObj.pay = e.dataValues.Payment_Status;
            if (e.dataValues.Payment_Status === 'Unpaid') {
                finalObj = {
                    ...appObj
                };
                appArr.push(finalObj);
            }
        };
        if (appArr.length === 0) {
            return res.status(200).render('upcomingAppointments', {
                mesg2: true
            });
        } else {
            return res.status(200).render("upcomingAppointments", {
                mesg1: appArr
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(400).render('errorPage', {
            error: true
        });
    }
}

//-----------------------------------------------------------------------------------//

//delete appointments
const deleteAppointments = async (req, res) => {
    try {
        if (req.user.User_Type !== "Patient") {
            return res.status(400).render('errorPage', {
                unauthorized: true
            });
        }
        const id = req.params.id;
        PatientAppDetail.destroy({
            where: {
                App_ID: id
            }
        }).then((result) => {
            console.log('deleted successfully');
            return res.redirect(req.get('referer'));
        }).catch((err) => {
            console.log(err);
        });
    } catch (e) {
        console.log(e);
        return res.status(404).render('errorPage', {
            error: true
        });
    }
}
//-----------------------------------------------------------//

//exporting
module.exports = {
    getBookAppointmentPage,
    searchDoctors,
    getDateChooser,
    recordAppointment,
    getUpcomingAppointments,
    deleteAppointments
}