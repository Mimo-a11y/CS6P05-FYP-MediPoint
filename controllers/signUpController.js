const { validationResult } = require('express-validator');
const db = require('../models');
const registerService = require('../services/registerService');

//create main model
const User = db.users;


// making functions for main routing stuffs

//1. get signup page
const getSignUpPage = (req,res) => {
    res.status(200).render("signUp", {errors: req.flash("errors")});
}

//1. create a new user
const createNewUser = async (req,res) => {
    //validate all required fields
    let errorsArr = [];
    let validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        let errors = Object.values(validationErrors.mapped());
        errors.forEach((item) => {
            errorsArr.push(item.msg);
            req.flash("errors", errorsArr);
            return res.redirect("/signUp");
        });
    }
    try{
        let newUser = {
            fullname: req.body.name,
            email: req.body.email,
            password: req.body.password,
            userType: req.body.userType
        }
        await registerService.createNewUser(newUser); //asynchronous process to create a new user
        res.redirect('/login'); //redirecting back to the login page after the user registers

    }catch(e){
        req.flash("errors", e);
        return res.redirect("/signUp");
    }
}

//exporting
module.exports= {
    getSignUpPage,
    createNewUser
}
