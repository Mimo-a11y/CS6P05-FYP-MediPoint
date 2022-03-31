//importing
const db = require('../models');
const bcrypt = require('bcryptjs');
const argon2 = require('argon2');
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
            let isMatch = false;
            if(user.User_Type === "Doctor" || user.User_Type === "Clinic"){ //conditions to compare passwords either with bcryptjs or argon2
                isMatch = await argon2.verify(user.Password, password);
            }else{
                if(user.Password.slice(0, 2) === "$2"){
                    isMatch = await bcrypt.compare(password, user.Password);
                }else{
                isMatch = await argon2.verify(user.Password, password);
                }
            }
            if(isMatch){
                resolve(true);
            }else{
            resolve("Incorrect password");
            }

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