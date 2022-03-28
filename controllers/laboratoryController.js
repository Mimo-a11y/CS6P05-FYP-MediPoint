const db = require('../models');
const { Op } = require("sequelize");
const { json } = require('body-parser');
let nodemailer = require('nodemailer');



// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;
const HealthLog = db.Health_Log;
const OpdCard = db.Patient_OPD;
const DoctorOPD = db.Doctor_OPD;
const LabReports = db.Lab_Reports;

//get the incoming lab tests 
const getLabTests = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
    const labReports = await LabReports.findAll({
         where: { Test_Done: 'No', 
        Test_Pay_Status: 'Paid', 
        [Op.not]: [
            {
              Test_Name: {
                [Op.like]: 'N/A'
              }
            }
        ]},
        attributes: [ 'Report_ID', 'Test_No', 'Test_Name', 'Test_Pay_Status', 'Test_Done'],
        include: [{
            model: HealthLog,
            attributes:['Card_No', 'Visit_No', 'LabReportReportID'],
            include:[{
                model: Patient,
                attributes:['P_ID'],
                include: [{
                    model: User,
                    attributes: ['Full_Name']
                }]
            },
            {
                model: Doctor,
                attributes: ['D_ID'],
                include: [{
                    model: User,
                    attributes: ['Full_Name']
                }]
            }
        ]
        }]
    }).catch((err) => {console.log(err)});
    if(labReports.length === 0){
        return res.status(200).render('laboratoryDashboard', {mesg1: true});
    }else{
        return res.status(200).render('laboratoryDashboard', {mesg2: labReports});
        //return res.json(labReports);
    }
}catch(e){
    console.log(e);
    return res.status(404).render('errorPage', {error: true});
}
}
//---------------------------------------------------------------------------------------------//

//get lab test details and upload reports form
const LabTestsDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
        const report = await LabReports.findOne({
            where: {Report_ID: req.params.reportid, Test_No: req.params.testno, Test_Done: 'No'},
            include:[
            {
                model: HealthLog,
                attributes: ['Card_No'],
                include:[{
                    model: Patient,
                    attributes:['P_ID', 'Age', 'Gender'],
                    include:[{
                    model: User,
                    attributes:['Full_Name']   
                    }]
                }]
            }]
        });
        if(report.length === 0){
            return res.status(200).render('uploadLabReports', {mesg2: true});
        }else{
       return res.status(200).render('uploadLabReports', {mesg1: report});
        }


    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//----------------------------------------------------------------------------------------//

// upload lab tests reports
const uploadReports = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return res.status(400).render('errorPage', {unauthorized: true});
        }
        const file = req.files.file;
        const filename = new Date().getTime() +'_'+file.name;
        file.mv('./uploads/'+filename, async (err) => {
                if(err){
                    console.log(err);
                    return res.status(404).render('errorPage', {error: true});
                }else{
                    await LabReports.update(
                        {Test_Done: 'Yes', File_Data: filename},
                        {where: {Report_ID: req.params.reportid, Test_No: req.params.testno}}
                    ).catch((err) => {console.log(err)});

                    //FOR EMAIL SENDING
                    const patient = await Patient.findOne({
                        attributes:['P_ID'],
                        where: {P_ID: req.params.pid},
                        include:[{
                            model: User,
                            attributes:['Full_Name', 'Email']
                        }]
                    });
                    const labTest = await LabReports.findOne({
                        attributes:['Test_No', 'Test_Name'],
                        where: {Report_ID: req.params.reportid, Test_No: req.params.testno}
                    });
                     // e-mail message options
  let mailOptions = {
    from: {
        name: 'MediPoint',
        address: 'medipoint72@gmail.com'
      },
    to: patient.User.Email,
    subject: 'Lab test completed',
    html: ` 
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f9f9f9" id="bodyTable">
        <tbody>
            <tr>
                <td style="padding-right:10px;padding-left:10px;" align="center" valign="top" id="bodyCell">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperWebview" style="max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top: 20px; padding-bottom: 20px; padding-right: 0px;" align="right" valign="middle" class="webview"> <a href="#" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:right;text-decoration:underline;padding:0;margin:0" target="_blank" class="text hideOnMobile"></a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody" style="max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard" style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                                        <tbody>
                                            <tr>
                                                <td style="background-color:#00d2f4;font-size:1px;line-height:3px" class="topBorder" height="3">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 60px; padding-bottom: 20px;" align="center" valign="middle" class="emailLogo">
                                                    <a href="#" style="text-decoration:none" target="_blank">
                                                        <img alt="" border="0" src="https://i.ibb.co/6mRFFzS/logo.png" style="width:100%;max-width:150px;height:auto;display:block" width="150">
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 5px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="mainTitle">
                                                    <h2 class="text" style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">Hi, ${patient.User.Full_Name}</h2>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 30px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="subTitle">
                                                    <h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">This a notification for your medical lab tests at Tarakeshwor Health Clinic</h4>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
                                                        <tbody>
                                                            <tr>
                                                                <td style="padding-bottom: 20px;" align="center" valign="top" class="description">
                                                                    <p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">Your <b>${labTest.Test_Name}</b> has been completed. The lab reports are uploaded in your MediPoint app. Kindly, login to the app to view your reports.</p>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size:1px;line-height:1px" height="20">&nbsp;</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                                        <tbody>
                                            <tr>
                                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperFooter" style="max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="socialLinks">
                                                    <a href="#facebook-link" style="display:inline-block" target="_blank" class="facebook">
                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/facebook.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                    </a>
                                                    <a href="#instagram-link" style="display: inline-block;" target="_blank" class="instagram">
                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/instagram.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
                                                    <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;MediPoint Inc. | Tarakeshwor, 08 | Kathmandu, NEPAL.</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
                                                    <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any questions please contact us at medipoint72@mail.com.</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>`         
};

// e-mail transport configuration
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'medipoint72@gmail.com',
      pass: 'ysmokjcjpkjblwil'
    }
});

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
});
                    return res.redirect('/dashboard/Laboratory/incomingLabTests');
                }
        })
    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}

//exporting
module.exports= {
    getLabTests,
    LabTestsDetails,
    uploadReports

}