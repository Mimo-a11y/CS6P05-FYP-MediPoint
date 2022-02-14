//importing necessary packages
const routes = require('express').Router();
const loginController = require('../controllers/loginController');
const signUpController = require('../controllers/signUpController');
const auth = require('../validation/authValidation');
const passport = require('passport');
const initPassportLocal = require('../controllers/passportLocalController');
const homePageController = require('../controllers/homePageController');
const sympRecorderController = require('../controllers/symptomsRecorderController');
const bookAppointmentController = require('../controllers/bookAppointmentController');
const opdController = require('../controllers/opdDashboardController');
const doctorController = require('../controllers/doctorDashboardController');

//calling the function from passportLocalController
initPassportLocal();

//creating routes for the home page
routes.get('/', (req,res) => {
        res.render('mainHomePage');
})
routes.get('/dashboard', loginController.checkLoggedIn, homePageController.getHomePage);
routes.post('/addPatient',loginController.checkLoggedIn, homePageController.addNewPatient );
//creating routes for the login page
routes.get('/login', loginController.checkLoggedOut, loginController.getLoginPage);
routes.post('/login', passport.authenticate("local", {   //setting local passport strategy
        successRedirect: "/dashboard",
        failureRedirect: "/login", 
        successFlash: true,
        failureFlash: true    
}));

//creating routes for the sign up page
routes.get('/signUp', signUpController.getSignUpPage);
routes.post('/signUp', auth.validateSignUp, signUpController.createNewUser);
routes.post('/logout', loginController.postLogOut);

//creating routers for symptom recorder
routes.get('/dashboard/Symptoms',sympRecorderController.getSymptomsRecorderPage);
routes.post('/dashboard/Symptoms', sympRecorderController.recordSymptoms);
routes.get('/dashboard/Symptoms/:sympID', sympRecorderController.deleteSymptoms);

//creating routes for booking appointments
routes.get('/dashboard/bookAppointments', bookAppointmentController.getBookAppointmentPage);
routes.get('/dashboard/bookAppointments/doctors', bookAppointmentController.searchDoctors);
routes.get('/dashboard/bookAppointments/doctors/book/:id', bookAppointmentController.getDateChooser);
routes.post('/dashboard/bookAppointments/doctors/book/:id/bookingConfirmed', bookAppointmentController.recordAppointment);

//creating routes for upcoming appointments appointments
routes.get('/dashboard/upcomingAppointments', bookAppointmentController.getUpcomingAppointments);
routes.get('/dashboard/upcomingAppointments/cancelBookings/:id', bookAppointmentController.deleteAppointments);

//creating routes for OPD dashboard
routes.get('/dashboard/OPD/incomingAppointments',opdController.getOpdDashboardPage);
routes.get('/dashboard/OPD/incomingAppointments/appointmentDetails/appID/:appid/dID/:did', opdController.getAppDetail);
routes.get('/dashboard/OPD/incomingAppointments/appointmentDetails/remove/:id', opdController.deleteAppointments);
routes.get('/dashboard/OPD/incomingAppointments/appointmentDetails/confirm/:id', opdController.updateAppointments);
routes.get('/dashboard/OPD/incomingAppointments/appointmentDetails/confirmedAppointments', opdController.getConfirmedAppointmentsPage);
routes.get('/dashboard/OPD/incomingAppointments/appointmentDetails/confirmedAppointments/newOPDCard/:appid/dID/:did/pID/:pid', opdController.makeOpdCard);
routes.get('/dashboard/OPD/incomingAppointments/appointmentDetails/confirmedAppointments/reappointmentOPDCard/:appid/dID/:did/pID/:pid', opdController.getOpdCard);
routes.post('/dashboard/OPD/incomingAppointments/appointmentDetails/confirmedAppointments/reappointmentOPDCard/dID/:did/pID/:pid/cardNo/:cardno/followUpUpdate', opdController.followUpUpdate);

//creating routes for Doctors dashboard
routes.get('/dashboard/incomingVisits/:did', doctorController.getTodaysOPDcard);
routes.get('/dashboard/incomingVisits/dID/:did/pID/:pid', doctorController.getPatientOpdCard);
routes.get('/dashboard/incomingVisits/cardNo/:cardno/visitNo/:visitno', doctorController.getVisitDetails);
routes.post('/dashboard/incomingVisits/cardNo/:cardno/visitNo/:visitno/addVisitDetails', doctorController.updateVisitDetails);

//exporting
module.exports = routes;

