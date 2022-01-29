const db = require('../models');
const Patient = db.patients;

let getHomePage = async (req,res) => {
        if(req.user.User_Type === "Patient"){
            const patient = await Patient.findOne({ where: { UserUID: req.user.U_ID } });
            if(patient === null){
                res.status(200).render('patientInfo');
            }else{
                res.status(200).render('patientHomePage', {
                    user: req.user
                })
            };
        }
        else if(req.user.User_Type === "Doctor"){
            res.status(200).render('doctorHomePage', {
                user: req.user
            });
        }
        else if(req.user.User_Type === "Clinic"){
            res.status(200).render('clinicHomePage', {
                user: req.user
            });
        }
}
let addNewPatient = async (req,res) => {
    let data = {
        Patient_Name: req.body.patient_name,
        P_Address: req.body.pAddress,
        Phone: req.body.phone,
        Age: req.body.age,
        Gender:req.body.gender,
        UserUID: req.user.U_ID
    }
    Patient.create(data);
    res.status(200).render("patientHomePage",{
        user: req.user
    });
}


module.exports = {
    getHomePage,
    addNewPatient
}