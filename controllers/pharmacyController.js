const db = require('../models');
const { Op } = require("sequelize");
let nodemailer = require('nodemailer');


// create main model
const AppointmentDetails = db.Patient_Appointment_Detail;
const Patient = db.patients;
const User = db.users;
const Doctor = db.doctors;
const HealthLog = db.Health_Log;
const OpdCard = db.Patient_OPD;
const DoctorOPD = db.Doctor_OPD;
const Prescription = db.Prescriptions;

//get the pharmacy dashboard page
const getPharmacyDashboardPage = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        const patient = await Patient.findAll({
            attributes: ['P_ID'],
            include: [{
                model: User,
                attributes:['Full_Name']
            },{
                model: HealthLog,
                attributes:['Card_No', 'Visit_No', 'PrescriptionPresID'],
                where: {Visit_Date: new Date().toISOString().slice(0, 10)},
                include:[{
                    model: Prescription,
                    where:{
                        Pres_No: 1,
                        [Op.not]: [
                            {
                              Medicine_Name: {
                                [Op.like]: 'N/A'
                              }
                            }
                          ]
                    },
                    attributes:['Pres_ID', 'Pres_No', 'Medicine_Name']
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
            return res.status(200).render('pharmacyDashboard', {mesg1: true, incomingMesg: true});
        }else{
            return res.status(200).render('pharmacyDashboard', {mesg2: patient, incomingMesg: true});
        }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//-----------------------------------------------------------------------------//

//get prescriptions details
const getPresDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        let medicines = await Prescription.findAll({
            where: {Pres_ID: req.params.presid, Med_Pay_Status: 'Unpaid', Received: 'N/A'},
            attributes: ['Pres_ID', 'Medicine_Name', 'Pres_No', 'Med_Pay_Status', 'Description', 'Duration', 'Days']
        });
        if(medicines.length === 0){
            return res.status(200).render('pharmacyDashboard', {mesg4:true, incomingMesg: true});
        }else{
            return res.status(200).render('pharmacyDashboard', {mesg3: medicines, incomingMesg: true});
        }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//------------------------------------------------------------------------------------------------//

//confirm medicine payment
const confirmPrescriptionsDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        await Prescription.update(
            {Med_Pay_Status: "Paid", Received: 'Yes'},
            {where: {Pres_ID: req.params.presid, Pres_No: req.params.presno}}
        );

        //FOR EMAIL
        const patient = await Patient.findOne({
            attributes:['P_ID'],
            where: {P_ID: req.params.pid},
            include:[{
                model: User,
                attributes:['Full_Name', 'Email']
            }]
        });
        const medicine = await Prescription.findOne({
            attributes:['Pres_No', 'Medicine_Name', 'Description', 'Days', 'Duration'],
            where: {Pres_ID: req.params.presid, Pres_No: req.params.presno}
        })
        // e-mail message options
  let mailOptions = {
    from: {
        name: 'MediPoint',
        address: 'medipoint72@gmail.com'
    },
    to: patient.User.Email,
    subject: 'Medicine reminder',
    text: `Hello ${patient.User.Full_Name}, below are your medicine details \n Medicine Name: ${medicine.Medicine_Name} Prescription no: ${medicine.Pres_No}`,
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
												<h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">This is a medicine reminder for you</h4>
											</td>
										</tr>
										<tr>
											<td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
												<table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
													<tbody>
														<tr>
															<td style="padding-bottom: 20px;" align="center" valign="top" class="description">
																<p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">You are prescribed <b>${medicine.Medicine_Name}</b> medicine for <b>${medicine.Days}</b> days to be taken in the duration of <b>${medicine.Duration}</b> hours. </p>
															</td>
														</tr>
													</tbody>
												</table>
												<table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton" style="">
													<tbody>
														<tr>
															<td style="padding-top:20px;padding-bottom:20px" align="center" valign="top">
																<table border="0" cellpadding="0" cellspacing="0" align="center">
																	<tbody>
																		<tr>
																			<td style="background-color: rgb(0, 210, 244); padding: 12px 35px; border-radius: 50px;" align="center" class="ctaButton"> <a href="#" style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-decoration:none;display:block" target="_blank" class="text"><b>Directions for use:</b> <br> ${medicine.Description}</a>
																			</td>
																		</tr>
																	</tbody>
																</table>
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
        return res.redirect(req.get('referer'));

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//---------------------------------------------------------------------------------------//

//confirm lab test payment
const cancelPrescriptionsDetails = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        await Prescription.update(
            {Received: 'No'},
            {where: {Pres_ID: req.params.presid, Pres_No: req.params.presno}}
        );
        return res.redirect(req.get('referer'));

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}
//---------------------------------------------------------------------------//

//get confirmed prescriptions
const getConfirmedPrescriptions = async (req,res) => {
    try{
        if(req.user.User_Type !== "Clinic"){
            return  res.status(400).render('errorPage', {unauthorized: true});
        }
        const patient = await Patient.findAll({
            attributes: ['P_ID'],
            include: [{
                model: User,
                attributes:['Full_Name']
            },{
                model: HealthLog,
                attributes:['Card_No', 'Visit_No', 'PrescriptionPresID'],
                where: {Visit_Date: new Date().toISOString().slice(0, 10)},
                include:[{
                    model: Prescription,
                    where:{
                        Pres_No: 1,
                        Med_Pay_Status: 'Paid',
                        Received: 'Yes',
                        [Op.not]: [
                            {
                              Medicine_Name: {
                                [Op.like]: 'N/A'
                              }
                            }
                          ]
                    },
                    attributes:['Pres_ID', 'Pres_No', 'Medicine_Name', 'Med_Pay_Status', 'Received']
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
            return res.status(200).render('pharmacyDashboard', {mesg5: true, confirmedMesg: true});
        }else{
            return res.status(200).render('pharmacyDashboard', {mesg6: patient, confirmedMesg: true});
        }

    }catch(e){
        console.log(e);
        return res.status(404).render('errorPage', {error: true});
    }
}


//exporting
module.exports = {
    getPharmacyDashboardPage,
    getPresDetails,
    confirmPrescriptionsDetails,
    cancelPrescriptionsDetails,
    getConfirmedPrescriptions
}