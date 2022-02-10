const db = require('../models');

// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;
const HealthLog = db.Health_Log;
const OpdCard = db.Patient_OPD;
const DoctorOPD = db.Doctor_OPD;


//get OPD dashboard page
const getOpdDashboardPage = async (req,res) => {
    try{
        const appointments = await Patient.findAll({ 
            attributes: ['P_ID','P_Address','Phone'],
            include:[{
                model: AppointmentDetails,
                where: {App_Date : new Date().toISOString().slice(0, 10), Payment_Status: 'Unpaid'}
            },{
                model: User,
                attributes: ['Full_Name']
            },
            ]
        });
        if(appointments.length === 0){
            return res.status(200).render('opdDashboard', {mesg2: true});
        }else{
        return res.status(200).render('opdDashboard', {mesg1: appointments});
        }
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}
//-----------------------------------------------------------------------------------//

//get appointment detail
const getAppDetail = async (req, res) => {
    try{
    const doctor = await Doctor.findAll({
        where: {D_ID: req.params.did},
        include:[{model: User, attributes: ['Full_Name']}]
    });
    const appointments = await AppointmentDetails.findOne({
        where: {App_ID: req.params.appid},
    });
    return res.status(200).render('appointmentDetails', {mesg1: doctor, mesg2: appointments});
}catch(e){
    console.log(e);
    return res.status(404).render('errorPage');
}
}

//-------------------------------------------------------------------------------//

//remove appointments
const deleteAppointments = async (req, res) => {
    try{
    const id = req.params.id;
    AppointmentDetails.destroy({where: {App_ID: id}}).then((result) => {
         console.log('deleted successfully');
         return res.redirect('/dashboard/OPD/incomingAppointments');
      }).catch((err) => {
         console.log(err);
      });
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}

//--------------------------------------------------------------------------------//

//get confirmed appointments page
const getConfirmedAppointmentsPage = async (req, res) => {
    try{
        const newAppointments = await Patient.findAll({ 
            attributes: ['P_ID','P_Address','Phone'],
            include:[{
                model: AppointmentDetails,
                where: {App_Date : new Date().toISOString().slice(0, 10), Payment_Status: 'Paid', App_Type: 'New'}
            },{
                model: User,
                attributes: ['Full_Name']
            },
            ]
        });
        const reAppointments = await Patient.findAll({ 
            attributes: ['P_ID','P_Address','Phone'],
            include:[{
                model: AppointmentDetails,
                where: {App_Date : new Date().toISOString().slice(0, 10), Payment_Status: 'Paid', App_Type: 'Follow-Up'}
            },{
                model: User,
                attributes: ['Full_Name']
            },
            ]
        });
        if(newAppointments.length === 0 && reAppointments.length === 0){
            return res.status(200).render('confirmedAppointmentsOPD', {mesg2: true});
        }else{
        return res.status(200).render('confirmedAppointmentsOPD', {mesg1: newAppointments, mesg3:reAppointments});
        }


    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}

//updating the appointment status
const updateAppointments = async (req,res) => {
    try{
        const id = req.params.id;
        const appointment = await AppointmentDetails.update(
            {Payment_Status: 'Paid'},
            {where: {App_ID: id}});
        return res.status(200).redirect('/dashboard/OPD/incomingAppointments/appointmentDetails/confirmedAppointments');
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}

//---------------------------------------------------------------------------//

//Make OPD card
const makeOpdCard = async (req,res) => {
    try{
        //retrieving patient details
        const patient = await Patient.findAll({ 
            where:{ P_ID: req.params.pid },
            include:[
                {
                    model: User,
                    attributes:['Full_Name']
                }
            ]
        });

        //retrieving doctor details
        const doctor = await Doctor.findAll({
            where: {D_ID: req.params.did},
            include:[{model: User, attributes: ['Full_Name']}]
        });

        //retrieving appointment details
        const appointments = await AppointmentDetails.findOne({
            where: {App_ID: req.params.appid},
        });

        // checking if the opd card already exists
        const opdCardExists = await HealthLog.findAll({
            include:[
                {
                    model: Patient,
                    where:{P_ID: patient[0].P_ID}
                },{
                    model: Doctor,
                    where:{D_ID: doctor[0].D_ID }
                }
            ]
         });

        if(opdCardExists.length === 0){
        //inserting into health log table
        let opdCard = {
            Visit_No: 1,
            Visit_Date: appointments.App_Date,
        }
        let cardNo = await HealthLog.create(opdCard).then(result => {return result.Card_No});

        //inserting into patient_OPD table
        let patientOpd = {
            PatientPID: patient[0].P_ID,
            HealthLogCardNo: cardNo
        }
        await OpdCard.create(patientOpd);

        //inserting into doctor_OPD table
        let doctorOpd = {
            DoctorDID: doctor[0].D_ID,
            HealthLogCardNo: cardNo
        }
        await DoctorOPD.create(doctorOpd);

        //retrieving patient opd card's details
        const patientOPDcard = await HealthLog.findOne({
            where: {Card_No: cardNo},
            attributes:['Card_No', 'Visit_No', 'Visit_Date']
        });  
        return res.status(200).render('opdCard', {mesg1: patient, mesg2: doctor, mesg3: appointments, mesg4: patientOPDcard});
    }else{
        return res.status(200).render('opdCard', {mesg5: true});
        
    }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}
//--------------------------------------------------------------------------------------------//

// updating the follow up visit number
const getOpdCard = async (req,res) => {
    try{
        //retrieving patient details
        const patient = await Patient.findAll({ 
            where:{ P_ID: req.params.pid },
            include:[
                {
                    model: User,
                    attributes:['Full_Name']
                }
            ]
        });

        //retrieving doctor details
        const doctor = await Doctor.findAll({
            where: {D_ID: req.params.did},
            include:[{model: User, attributes: ['Full_Name']}]
        });

        //retrieving appointment details
        const appointments = await AppointmentDetails.findOne({
            where: {App_ID: req.params.appid},
        });
        // extracting the patient opd card
        const opdCard = await HealthLog.findAll({
            include:[
                {
                    model: Patient,
                    where:{P_ID: req.params.pid}
                },{
                    model: Doctor,
                    where:{D_ID: req.params.did }
                }
            ]
         });
         //return res.json(opdCard);
         return res.status(200).render('opdCard', {mesg1: patient, mesg2: doctor, mesg3: appointments, mesg6: opdCard});

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}
//------------------------------------------------------------------------------------------//

const followUpUpdate = async(req,res) => {
    try{
        //updating the followup visit record
        let data = {
            Card_No: req.params.cardno,
            Visit_No: req.body.visitno,
            Visit_Date: req.body.visitDate 
        }
        await HealthLog.create(data);
        return res.status(200).render('opdCard', {mesg1: patient, mesg2: doctor, mesg3: appointments, mesg6: opdCard});

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage');
    }
}

//exporting
module.exports = {
    getOpdDashboardPage,
    getAppDetail,
    deleteAppointments,
    updateAppointments,
    getConfirmedAppointmentsPage,
    makeOpdCard,
    getOpdCard,
    followUpUpdate
}