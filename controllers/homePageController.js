const db = require('../models');
const Patient = db.patients;
const Doctor = db.doctors;

let getHomePage = async (req,res) => {
    const doctor = await Doctor.findOne({ where: { UserUID: req.user.U_ID } });
        if(req.user.User_Type === "Patient"){
            const patient = await Patient.findOne({ where: { UserUID: req.user.U_ID } });
            if(patient === null){
                res.status(200).render('patientInfo');
            }else{
                res.status(200).render('patientHomePage', {
                    user: req.user, patient: patient
                })
            };
        }
        else if(req.user.User_Type === "Doctor"){
            res.status(200).render('doctorHomePage', {
                user: req.user, doctor: doctor
            });
        }
        else if(req.user.User_Type === "Clinic"){
            res.status(200).render('clinicHomePage', {
                user: req.user
            });
        }
}
let addNewPatient = async (req,res) => {
    try{
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
}catch(e){
    res.status(404).render('errorPage',  {error: true});
}
}


module.exports = {
    getHomePage,
    addNewPatient
}