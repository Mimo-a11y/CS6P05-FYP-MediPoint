//importing
const db = require('../models');
const bcrypt = require('bcryptjs');
//create main model
const User = db.users;

//creating functions for passport local strategy

let findUserByEmail = (email) => {
    return new Promise((resolve,reject) => {
        try{
            User.findOne({ where: { Email: email }}, {plain: true}).then((user) => {
                resolve(user);
            });
        }catch(e){
            reject(e);
        }
    });
}

let compareUserPassword= (user, password) => {
    return new Promise(async (resolve,reject) => {
        try{
            let isMatch = await bcrypt.compare(password, user.Password);
            if(isMatch){
                resolve(true);
            }
            resolve("The password that you have entered is incorrect!");

        }catch(e){
            reject(e);
        }
    })
}

let findUserById = (id) => {
    return new Promise((resolve, reject) => {
        try{
            User.findOne({ where: { U_ID: id } }, {plain:true}).then((user) => {
                resolve(user);
            }).catch((err) => {
                reject(err);
            });

        }catch(e){
            reject(e);
        }
    })

};

//exporting
module.exports = {
    findUserByEmail,
    compareUserPassword,
    findUserById
}