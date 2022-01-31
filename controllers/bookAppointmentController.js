const db = require('../models');

//creating main model
const Doctor = db.doctors;
const User = db.users;

//get the book appointment page
 
const getBookAppointmentPage = async (req, res) => {
        try{
           const userType = await User.findOne({attributes:['User_Type'], where:{U_ID: req.user.U_ID}});
           if(userType.User_Type !== "Patient"){
            return res.status(400).render('errorPage');
        }else{
            return res.status(200).render('bookAppointment');
        }
        }catch(e){
            console.log(e);
            return res.status(400).render('errorPage');
        }

}
//--------------------------------------------------------------------//

//search doctors
const searchDoctors = async (req, res) => {
    try{
        const doctors = await Doctor.findAll({ 
        where:{ Dept_Name: req.query.departments },
        include: User
        }
    )
    if(doctors.length < 1){
        res.status(200).render('bookAppointment', {mesg1: true})
    }else{
    var doctorsObj = {}
    var doctorsArr = [];
    doctors.forEach((e) => {
        doctorsObj.contact = e.dataValues.Contact;
        doctorsObj.address = e.dataValues.D_Address;
        doctorsObj.dept = e.dataValues.Dept_Name;
        doctorsObj.exp = e.dataValues.Years_of_Exp;
        doctorsObj.regNo = e.dataValues.NMC_No;
        doctorsObj.day = e.dataValues.Avl_Day;
        doctorsObj.time = e.dataValues.Avl_Time;
        doctorsObj.name = e.dataValues.User.Full_Name;
        const finalObj = {...doctorsObj};
        doctorsArr.push(finalObj);
        
    });
    return res.status(200).render('bookAppointment', {mesg2: doctorsArr});  
} 
    }catch(e){
        console.log(e);
        return res.status(400).render('errorPage');

    }
}
//------------------------------------------------------------------------------//


//exporting
module.exports = {
    getBookAppointmentPage,
    searchDoctors
}