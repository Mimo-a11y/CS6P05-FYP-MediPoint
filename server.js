//Importing packages
const Express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectFlash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
let AdminJs = require('adminjs');
const AdminJsExpress = require('@adminjs/express');
const AdminJsSequelize = require('@adminjs/sequelize');
const db = require('./models');
const passwordFeature = require('@adminjs/passwords');
const argon2 = require('argon2');
var expressHbs = require('hbs');
const upload = require('express-fileupload');
const path = require('path');
var cron = require('node-cron');
var nodemailer = require('nodemailer');
const User = db.users;
const Patient = db.patients;
const PatientAppDetail = db.Patient_Appointment_Detail;
const Doctor = db.doctors;


//instanciating express app
const app = new Express();

//static files use
app.use(Express.static(path.join(__dirname, "public")));

//configuring dotenv
dotenv.config();

//use cookie parser
app.use(cookieParser("secret"));

//session configuration
app.use(session({
  secret: "secret",
  resave: "true",
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 //1 day
  }
}));

//app.use(ValidationError());

//ADMIN CONFIGURATIONS
//regestering the adapter
const admin = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD
}
AdminJs.registerAdapter(AdminJsSequelize);

//admin
const adminJs = new AdminJs({
  rootPath: '/admin',
  resources: [{
      resource: db.users,
      options: {
        properties: {
          Password: {
            isVisible: false
          },
          User_Type: {
            isDisabled: true
          },
        },
        actions: {
          delete: {
            isVisible: (context) => context.record.param('User_Type') == 'Doctor',
          },
          bulkDelete: {
            isVisible: false
          },
          new: {
            before: async (request) => {
              const {
                payload
              } = request;
              payload.User_Type = "Doctor"
              return request
            }
          }
        },
      },
      features: [passwordFeature({
        // PasswordsOptions
        properties: {
          // to this field will save the hashed password
          encryptedPassword: 'Password'
        },
        hash: argon2.hash
      })],
    },
    {
      resource: db.doctors,
      options: {
        actions: {
          delete: {
            isVisible: false
          },
          bulkDelete: {
            isVisible: false
          },
          new:{
            before: async (request) => {
              const {
                payload
              } = request;
              var user = payload.UserUID;
              var userCheck = await User.findOne({
                where: {
                  U_ID: user
                },
                attributes: ['User_Type']
              });
              if(userCheck.User_Type == 'Doctor'){
                return request;
              }else{
                throw new ValidationError({
                  name: {
                    message: 'Something wrong happened',
                  },
                }, {
                  message: 'Cannot add Patient/Clinic as Doctor. Please select a valid User ID.',
                })
              }
            }
          }
        }
      },
    },
    {
      resource: db.patients,
      options: {
        actions: {
          new: {
            isVisible: false
          },
          delete: {
            isVisible: false
          },
          bulkDelete: {
            isVisible: false
          }
        }

      }
    },
    {
      resource: db.Patient_Appointment_Detail,
      options: {
        actions: {
          new: {
            isVisible: false
          },
          delete: {
            isVisible: false
          },
          bulkDelete: {
            isVisible: false
          },
          edit: {
            isVisible: false
          }
        }
      }
    }
  ],
  branding: {
    companyName: 'Medipoint - Admin panel',
    softwareBrothers: false,
    logo: false
  },
})
//admin authentication
let AdminRouter = AdminJsExpress.buildAuthenticatedRouter(adminJs, {
  authenticate: async (email, password) => {
    if (email === admin.email && password === admin.password) {
      return admin
    } else {
      return null
    }
  }
});

//setting up the router as middleware for admin panel
app.use(adminJs.options.rootPath, AdminRouter);

//middlewares
app.use(Express.json());
app.use(Express.urlencoded({
  extended: true
}));

//enable flash
app.use(connectFlash());

//handlebars configuration
app.set("view engine", "hbs");
app.set("views", "./view");

//configuring file upload
app.use(upload());

// register new helper function for handlebars
expressHbs.handlebars.registerHelper('isAvailable', function (filedata) {
  if (filedata == 'N/A') {
    return filedata = false;
  } else {
    return filedata = true;
  }
});

//configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

//for using external JS file
//app.use("/JS",Express.static(__dirname + "/JS"));
app.use("/public/images", Express.static(__dirname + "/public/images"));
//app.use("/public/assets",Express.static(__dirname + "/public/assets"));

//routing for home page
const router = require('./routes/web');
const {
  ValidationError
} = require('adminjs');
const users = require('./models/users');
app.use('/', router);


//UPCOMING APPOINTMENTS EMAIL
const setAppointmentReminders = async (req, res) => {
  var today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const appointments = await PatientAppDetail.findAll({
    where: {
      Payment_Status: 'Unpaid',
      App_Date: tomorrow.toISOString().split("T")[0]
    },
    include: [{
      model: Patient,
      include: [{
        model: User,
        attributes: ['Full_Name', 'Email']
      }]
    }]
  });
  const doctor = await Doctor.findOne({
    where: {
      D_ID: appointments[0].Patients[0].Patient_Appointments.Doctor_ID
    },
    attributes: ['D_ID'],
    include: [{
      model: User,
      attributes: ['Full_Name']
    }]
  })
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'medipoint72@gmail.com',
      pass: 'ysmokjcjpkjblwil'
    }
  });

  cron.schedule('00 45 10 * * *', () => {
    const sendWishes =
      // looping through the users
      appointments.forEach(appointment => {
        const mailOptions = {
          from: {
            name: 'MediPoint',
            address: 'medipoint72@gmail.com'
          },
          to: appointment.Patients[0].User.Email,
          subject: `Appointment reminder `,
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
												<h2 class="text" style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">Hi, ${appointment.Patients[0].User.Full_Name}</h2>
											</td>
										</tr>
										<tr>
											<td style="padding-bottom: 30px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="subTitle">
												<h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">This is an appointment reminder for you</h4>
											</td>
										</tr>
										<tr>
											<td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
												<table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
													<tbody>
														<tr>
															<td style="padding-bottom: 20px;" align="center" valign="top" class="description">
																<p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">You have an medical appointment with <b>Dr. ${doctor.User.Full_Name}</b> tommorow at Tarakeshwor Health Clinic.</p>
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
																			<td style="background-color: rgb(0, 210, 244); padding: 12px 35px; border-radius: 50px;" align="center" class="ctaButton"> <a href="#" style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-decoration:none;display:block" target="_blank" class="text">Date: ${appointments[0].App_Date} <br> <br> Time: ${appointments[0].App_Time} <br> <br> Type: ${appointments[0].App_Type} appointment</a>
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
        return transporter.sendMail(mailOptions, (error, data) => {
          if (error) {
            console.log(error)
            return
          } else {
            console.log(data.response);
          }
        });

      })
  });
}
setAppointmentReminders();

//server
app.listen(process.env.PORT, () => {
  console.log("server is running on port 3000");
})