const db = require('../models');

//create main model


// making functions for main routing stuffs

//1. get login page
const getLoginPage = (req, res) => {
    res.status(200).render("loginPage", {
        errors: req.flash("errors")
    });
}
//function to check logged in state of users

let checkLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}
//function to check logged out state of users

let checkLoggedOut = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
}

//delete the session and redirect to the login page
let postLogOut = (req, res) => {
    req.session.destroy((err) => {
        return res.redirect('/login');
    });
}
//exporting
module.exports = {
    getLoginPage,
    checkLoggedIn,
    checkLoggedOut,
    postLogOut
}