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

//instanciating express app
const app = new Express();

//configuring dotenv
dotenv.config();

//middlewares
app.use(Express.json());

app.use(Express.urlencoded({extended: true}));

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

//enable flash
app.use(connectFlash());

//handlebars configuration
app.set("view engine", "hbs");
app.set("views", "./view");

//configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// using static files
// app.use(Express.static(__dirname + '/public'));

//routing for home page
const router = require('./routes/web');
const users = require('./models/users');
app.use('/', router);

//regestering the adapter
AdminJs.registerAdapter(AdminJsSequelize);

//admin
const adminJs = new AdminJs({
  rootPath: '/admin',
  databases: [db], // you can still load an entire database and adjust just one resource
  resources: [{
    resource: db.users,
    options: {
       properties: { Password: { isVisible: false } }
    },
    features: [passwordFeature({
      // PasswordsOptions
      properties: {
        // to this field will save the hashed password
        encryptedPassword: 'Password'
      },
      hash: argon2.hash,
    })],
    
  }],
  branding: {
    companyName: 'Medipoint - Admin Panel',
  },
})
let AdminRouter = AdminJsExpress.buildRouter (adminJs);

//setting up the router as middleware for admin panel
app.use(adminJs.options.rootPath, AdminRouter);

//server
app.listen(process.env.PORT, () => {
    console.log("server is running on port 3000");
})