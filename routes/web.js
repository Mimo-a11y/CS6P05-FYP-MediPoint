//importing necessary packages
const routes = require('express').Router();
const loginController = require('../controllers/loginController');
const signUpController = require('../controllers/signUpController');
const auth = require('../validation/authValidation');
const passport = require('passport');
const initPassportLocal = require('../controllers/passportLocalController');
const homePageController = require('../controllers/homePageController');
const sympRecorderController = require('../controllers/symptomsRecorderController');

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

//exporting
module.exports = routes;

