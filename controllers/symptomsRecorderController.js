const db = require('../models');

// create main model
const PatientSymptomsDetail = db.Patient_Symptoms_Detail;
const PatientSymptom = db.Patient_Symptoms;
const Patient = db.patients;

//get symptoms recorder page
const getSymptomsRecorderPage = async (req,res) => {
    try{
    if(req.user.User_Type !== "Patient"){
        res.status(400).render('errorPage', {unauthorized: true});
    }
    const patientID = await Patient.findOne({attributes:['P_ID'], where:{UserUID: req.user.U_ID}});
    const symptoms = await Patient.findAll({
        attributes: ['P_ID'],
        where:{P_ID: patientID.P_ID}, 
        include:[{
            model: PatientSymptomsDetail,
            attributes: ['Symptom_ID','Symptom_Date', 'Symptom_Time', 'Symptom']
        }
        ]
    });
    var symptomsObj = {}
    var symptomsArr = [];
    symptoms[0].Patient_Symptoms_Details.forEach((e) => {
        symptomsObj.id = e.dataValues.Symptom_ID;
        symptomsObj.date = e.dataValues.Symptom_Date;
        symptomsObj.time = e.dataValues.Symptom_Time;
        symptomsObj.symptom = e.dataValues.Symptom;
        const finalObj = {...symptomsObj};
        symptomsArr.push(finalObj);
        
    });
    return res.status(200).render("patientSymptoms", {mesg: symptomsArr});
}catch(e){
    console.log(e);
    return res.status(404).render('errorPage', {error: true});
}
}
//-------------------------------------------------------------------//

//post symptoms
const recordSymptoms = async (req, res) => {
    try{
    if(req.user.User_Type !== "Patient"){
            res.status(400).render('errorPage', {unauthorized: true});
    }
    const patientID = await Patient.findOne({attributes:['P_ID'], where:{UserUID: req.user.U_ID}});
    let newSymptom = {
        Symptom_Date: req.body.date,
        Symptom_Time: req.body.time,
        Symptom: req.body.symptom,
    }
    let sympID = await PatientSymptomsDetail.create(newSymptom).then(result => {return result.Symptom_ID}); //inserting into Patient_Symptoms_Detail table
    let data ={
        PatientPID: patientID.P_ID, 
        PatientSymptomsDetailSymptomID: sympID
    }
    await PatientSymptom.create(data); // inserting into Patient_Symptoms table
    const symptoms = await Patient.findAll({
        attributes: ['P_ID'],
        where:{P_ID: patientID.P_ID}, 
        include:[{
            model: PatientSymptomsDetail,
            attributes: ['Symptom_ID','Symptom_Date', 'Symptom_Time', 'Symptom']
        }
        ]
    });
    var symptomsObj = {}
    var symptomsArr = [];
    symptoms[0].Patient_Symptoms_Details.forEach((e) => {
        symptomsObj.id = e.dataValues.Symptom_ID;
        symptomsObj.date = e.dataValues.Symptom_Date;
        symptomsObj.time = e.dataValues.Symptom_Time;
        symptomsObj.symptom = e.dataValues.Symptom;
        const finalObj = {...symptomsObj};
        symptomsArr.push(finalObj);
        
    });
    return res.status(200).render("patientSymptoms", {mesg: symptomsArr});
}catch(e){
    console.log(e);
    return res.status(404).render('errorPage', {error: true});

    
}
}
//--------------------------------------------------------------------------//

//delete symptoms
const deleteSymptoms = async (req, res) => {
    try{
        if(req.user.User_Type !== "Patient"){
            res.status(400).render('errorPage', {unauthorized: true});
        }
    const id = req.params.sympID;
     PatientSymptomsDetail.destroy({where: {Symptom_ID: id}}).then((result) => {
         console.log('deleted successfully');
         return res.redirect(req.get('referer'));
      }).catch((err) => {
         console.log(err);
      });

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//-----------------------------------------------------------//

//exporting
module.exports = {
    getSymptomsRecorderPage,
    recordSymptoms,
    deleteSymptoms
}