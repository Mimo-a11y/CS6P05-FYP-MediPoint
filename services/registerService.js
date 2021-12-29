//importing
const db = require('../models');
const bcryptjs = require('bcryptjs');

//create main model
const User = db.users;

//this function returns a promise
let createNewUser = (user) => {
    return new Promise(async (resolve, reject) => {
        try{
            //check if the email exists or not
            let check = await checkUserEmail(user.email);
            console.log(check);
            if(check){
                reject(`The email ${user.email} already exists. Please use another email.`);
            }
            else{
                //hash the users password
                let salt = bcryptjs.genSaltSync(10);
                let data = {
                    Full_Name: user.fullname,
                    Email: user.email,
                    Password: bcryptjs.hashSync(user.password, salt),
                    User_Type: user.userType
                }
                    User.create(data);
                    resolve("New user created successfully");
            }
        }catch(e){
            reject(e);
        }
    });
};

//creating a function to check the email
let checkUserEmail = (email) => {
    return new Promise(async(resolve,reject) => {
        try{
            const users = await User.findAll({ where: { Email: email } });
            let count= Object.keys(users).length;
            if(count > 0){
                resolve(true);
            }else{
                resolve(false);
            }
        }catch(e){
            reject(e);
        }
    });
}

module.exports = {
    createNewUser
}