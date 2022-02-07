const db = require('../models');

// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;


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
        const appointments = await Patient.findAll({ 
            attributes: ['P_ID','P_Address','Phone'],
            include:[{
                model: AppointmentDetails,
                where: {App_Date : new Date().toISOString().slice(0, 10), Payment_Status: 'Paid'}
            },{
                model: User,
                attributes: ['Full_Name']
            },
            ]
        });
        if(appointments.length === 0){
            return res.status(200).render('confirmedAppointmentsOPD', {mesg2: true});
        }else{
        return res.status(200).render('confirmedAppointmentsOPD', {mesg1: appointments});
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

//exporting
module.exports = {
    getOpdDashboardPage,
    getAppDetail,
    deleteAppointments,
    updateAppointments,
    getConfirmedAppointmentsPage
}