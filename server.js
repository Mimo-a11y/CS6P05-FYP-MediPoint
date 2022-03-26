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
var expressHbs =  require('hbs');
const upload = require('express-fileupload');
const path = require('path');
var cron = require('node-cron');
var nodemailer = require('nodemailer');
const User = db.users;
const Patient = db.patients;
const PatientAppDetail = db.Patient_Appointment_Detail;


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
        maxAge:1000 * 60 * 60 * 24 //1 day
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
         Password: { isVisible: false },
         User_Type: {
           isDisabled: true
         },
        },
        actions: {
          delete: {
            isVisible: (context) => context.record.param('User_Type') !== 'Clinic',
          },
          bulkDelete: {
            isVisible: false
          },
          new:{
            before: async (request) => {
              const {payload} = request;
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
  {resource: db.doctors,
    options: {
      actions:{
        delete:{
          isVisible: false
        },
        bulkDelete:{
          isVisible: false
        },
        // new: {
        //   before: async (request) => {
        //     const {method, payload} = request
        //     const users = await User.findAll({
        //       attributes: ["U_ID"], 
        //       where: {User_Type: 'Patient'} // Your filters here
        //   })
        //     // const arr = [];
        //     // for(let i=0; i<arr.length; i++){
        //     //   arr[i] = users.User.U_ID;
        //     // }
        //     console.log(users);
        //     if (method === 'post' && payload.UserUID === '1107') {
        //       console.log('patient added as doc');
        //       throw new ValidationError({
        //         UserUID: {
        //           message: 'cannot be "patient id"',
        //         },
        //       }, {
        //         message: 'something wrong happened',
        //       })
        //     }
        //     return request
        //   }
        // }
      }
 },
},
{
  resource: db.patients,
  options:{
    actions:{
      new:{
        isVisible: false
      },
      delete:{
        isVisible:false
      },
      bulkDelete:{
        isVisible:false
      }
    }

  }
}
],
  branding: {
    companyName: 'Medipoint',
    softwareBrothers: false,
    logo: false
  },
})
//admin authentication
let AdminRouter = AdminJsExpress.buildAuthenticatedRouter (adminJs,{
  authenticate: async (email,password) => {
    if(email === admin.email && password === admin.password){
      return admin
    }else{
      return null
    }
  }
});

//setting up the router as middleware for admin panel
app.use(adminJs.options.rootPath, AdminRouter);

//middlewares
app.use(Express.json());
app.use(Express.urlencoded({extended: true}));

//enable flash
app.use(connectFlash());

//handlebars configuration
app.set("view engine", "hbs");
app.set("views", "./view");

//configuring file upload
app.use(upload());

// register new helper function for handlebars
expressHbs.handlebars.registerHelper('isAvailable', function(filedata) {
  if(filedata == 'N/A'){
      return filedata = false;
  }else{
    return filedata = true;
  }
});

//configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

//for using external JS file
app.use("/JS",Express.static(__dirname + "/JS"));

//routing for home page
const router = require('./routes/web');
const { ValidationError } = require('adminjs');
const users = require('./models/users');
app.use('/', router);


//UPCOMING APPOINTMENTS EMAIL
const setAppointmentReminders = async (req, res) => {
       var today = new Date();
        let tomorrow =  new Date();
        tomorrow.setDate(today.getDate() + 1);
const appointments = await PatientAppDetail.findAll({
      where: {Payment_Status: 'Unpaid', App_Date: tomorrow.toISOString().split("T")[0]},
      include: [{
        model: Patient,
        include: [{
          model: User,
          attributes: ['Full_Name', 'Email']
        }]
      }
      ]
  });
  console.log(JSON.stringify(appointments));
  console.log(tomorrow.toISOString().split("T")[0]);
  console.log(appointments[0].Patients[0].User.Full_Name);
  console.log(appointments[0].Patients[0].User.Email);
  console.log(appointments[0].App_Date);
  console.log(appointments[0].App_Time);
  console.log(appointments[0].App_Type);
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'kmimo7na@gmail.com',
      pass: 'hjongizomfmjrlik'
    }
  });
  
  cron.schedule('00 00 13 * * *', () => {
    const sendWishes =  
      // looping through the users
     appointments.forEach(appointment => {
        const mailOptions = {
        from: 'kmimo7na@gmail.com',
        to: appointment.Patients[0].User.Email,
        subject: `Appointment reminder `,
        html: `Wishing You a <b>Happy birthday ${appointment.Patients[0].User.Full_Name}</b> On Your Enjoy your day \n <small>this is auto generated</small>`                       
    };
    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
          console.log(error)
          return
      }
  });
    
    }
   )});
}
setAppointmentReminders();

//server
app.listen(process.env.PORT, () => {
  console.log("server is running on port 3000");
})


