const db = require('../models');
const { Op } = require("sequelize");


// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;
const HealthLog = db.Health_Log;
const OpdCard = db.Patient_OPD;
const DoctorOPD = db.Doctor_OPD;
const LabReports = db.Lab_Reports;


//get OPD dashboard page
const getOpdDashboardPage = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
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
        return res.status(404).render('errorPage', {error: true});
    }
}
//-----------------------------------------------------------------------------------//

//get appointment detail
const getAppDetail = async (req, res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
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
    return res.status(404).render('errorPage', {error: true});
}
}

//-------------------------------------------------------------------------------//

//remove appointments
const deleteAppointments = async (req, res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
    const id = req.params.id;
    AppointmentDetails.destroy({where: {App_ID: id}}).then((result) => {
         console.log('deleted successfully');
         return res.redirect('/dashboard/OPD/incomingAppointments');
      }).catch((err) => {
         console.log(err);
      });
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}

//--------------------------------------------------------------------------------//

//get confirmed appointments page
const getConfirmedAppointmentsPage = async (req, res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
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
        return res.status(404).render('errorPage', {error: true});
    }
}

//updating the appointment status
const updateAppointments = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        const id = req.params.id;
        const appointment = await AppointmentDetails.update(
            {Payment_Status: 'Paid'},
            {where: {App_ID: id}});
        return res.status(200).redirect('/dashboard/OPD/incomingAppointments/appointmentDetails/confirmedAppointments');
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}

//---------------------------------------------------------------------------//

//Make OPD card
const makeOpdCard = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
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
        return res.status(404).render('errorPage', {error: true});
    }
}
//--------------------------------------------------------------------------------------------//

// updating the follow up visit number
const getOpdCard = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
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
            attributes: ['Card_No', 'Visit_No', 'Visit_Date'],
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
         var cardNumber = [];
         cardNumber[0] = {Card_No: opdCard[0].Card_No, D_ID: req.params.did, P_ID:req.params.pid};
         return res.status(200).render('followupOpdCard', {mesg1: patient, mesg2: doctor, mesg3: appointments, mesg6: opdCard, mesg7:true, mesg8: cardNumber});

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//------------------------------------------------------------------------------------------//

const followUpUpdate = async(req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
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
        const appointments = await Patient.findOne({
            attributes:['P_ID'],
            where: {P_ID: req.params.pid},
            include:[
                {
                    model: AppointmentDetails,
                    where: {App_Date: new Date().toISOString().slice(0, 10)},
                }
            ]
        });

        // extracting the patient opd card
        const getopdCard = await HealthLog.findAll({
            attributes:['Card_No','Visit_No', 'Visit_Date'],
            where:{Card_No: req.params.cardno},
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
         var cardNumber = [];
         cardNumber[0] = {Card_No: getopdCard[0].Card_No, D_ID: req.params.did, P_ID: req.params.pid};
        //updating the followup visit record
        let data = {
            Card_No: req.params.cardno,
            Visit_No: req.body.visitno,
            Visit_Date: req.body.visitDate 
        }
        await HealthLog.create(data);
        const opdCard = await HealthLog.findAll({
            attributes:['Card_No','Visit_No', 'Visit_Date'],
            where:{Card_No: req.params.cardno},
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
        return res.status(200).render('followupOpdCard', {mesg1: patient, mesg2: doctor, mesg4:appointments, mesg6: opdCard, mesg9: cardNumber});
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//----------------------------------------------------------------------------------------//

//update lab tests payment status
const getTodaysLabTests = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
    const patient = await Patient.findAll({
        attributes: ['P_ID'],
        include: [{
            model: User,
            attributes:['Full_Name']
        },{
            model: HealthLog,
            attributes:['Card_No', 'Visit_No', 'LabReportReportID'],
            where: {Visit_Date: new Date().toISOString().slice(0, 10)},
            include:[{
                model: LabReports,
                where:{
                    Test_No: 1,
                    [Op.not]: [
                        {
                          Test_Name: {
                            [Op.like]: 'N/A'
                          }
                        }
                      ]
                },
                attributes:['Report_ID', 'Test_No', 'Test_Name']
            },{
                model: Doctor,
                attributes: ['D_ID'],
                include: [{
                    model: User,
                    attributes: ['Full_Name']
                }]
            }]
        }]
    }).catch((err) => {console.log(err)});
    if(patient.length === 0){
        return res.status(200).render('labReports', {mesg1: true});
    }else{
        return res.status(200).render('labReports', {mesg2: patient});
    }
}catch(e){
    console.log(e);
    return res.status(404).render('errorPage', {error: true});
}
}

//----------------------------------------------------------------------------//

//get lab test details
const getLabTestsDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        let labTests = await LabReports.findAll({
            where: {Report_ID: req.params.reportid, Test_Pay_Status: 'Unpaid', Test_Done: 'N/A'},
            attributes: ['Report_ID', 'Test_Name', 'Test_No', 'Test_Pay_Status']
        });
        if(labTests.length === 0){
            return res.status(200).render('labReports', {mesg4:true});
        }else{
            return res.status(200).render('labReports', {mesg3: labTests});
        }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}

//-----------------------------------------------------------------------------------//

//confirm lab test payment
const confirmLabTestsDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
        await LabReports.update(
            {Test_Pay_Status: "Paid", Test_Done: 'No'},
            {where: {Report_ID: req.params.reportid, Test_No: req.params.testno}}
        );
        return res.redirect(req.get('referer'));

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//---------------------------------------------------------------------------------------//

//confirm lab test payment
const cancelLabTestsDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        await LabReports.update(
            {Test_Done: 'No'},
            {where: {Report_ID: req.params.reportid, Test_No: req.params.testno}}
        );
        return res.redirect(req.get('referer'));

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//-------------------------------------------------------------------------------------------//

//card search feature
const getopdCardSearchPage = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        return res.status(200).render('OPDCardSearch', {opdsearchpage: true});

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//------------------------------------------------------------------------------//

//get patient OPD card details
const getopdCardDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        // extracting the patient opd card
        const opdCard = await HealthLog.findAll({
            attributes: ['Card_No', 'Visit_No', 'Visit_Date'],
            where: {Visit_No: 1},
            include:[
                {
                    model: Patient,
                    where:{P_ID: req.query.cardsearch},
                    include: [{
                        model: User,
                        attributes: ['Full_Name']
                    },
                ]
                },{
                    model: Doctor,
                    include: [{
                        model: User,
                        attributes: ['Full_Name']
                    }]
                }
            ]
         });
         if(opdCard.length === 0){
            return res.status(200).render('OPDCardSearch', {mesg1: true, opdsearchpage: true});
         }else{
            return res.status(200).render('OPDCardSearch', {opdsearchmesg2: opdCard, opdsearchpage: true});
         }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//-----------------------------------------------------------------------//

//get individual card details
const getIndividualOpdCardDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
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

        // extracting the patient opd card
        const getopdCard = await HealthLog.findAll({
            attributes:['Card_No','Visit_No', 'Visit_Date'],
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
         var cardNumber = [];
         cardNumber[0] = {Card_No: getopdCard[0].Card_No, D_ID: req.params.did, P_ID: req.params.pid};
         return res.status(200).render('OPDcardDetails', {mesg1: patient, mesg2: doctor, opdsearchmesg4: getopdCard, mesg5: cardNumber});

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
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
    followUpUpdate,
    getTodaysLabTests,
    getLabTestsDetails,
    confirmLabTestsDetails,
    cancelLabTestsDetails,
    getopdCardSearchPage,
    getopdCardDetails,
    getIndividualOpdCardDetails
}