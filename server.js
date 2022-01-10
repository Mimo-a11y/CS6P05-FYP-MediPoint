//Importing packages
const Express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectFlash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroSequelize = require('@admin-bro/sequelize');
const db = require('./models');

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

//routing for home page
const router = require('./routes/web');
app.use('/', router);

//admin
let adminBro = new AdminBro ({
    Databases: [],
    rootPath: '/admin',
});
const AdminRouter = AdminBroExpress.buildRouter (adminBro);
//setting up the router as middleware for admin panel
app.use(adminBro.options.rootPath, AdminRouter);

//regestering the adapter
AdminBro.registerAdapter(AdminBroSequelize);

//loading database resources into adminBro
adminBro = new AdminBro({
  databases: [db], // you can still load an entire database and adjust just one resource
  resources: [{
    resource: db.users,
    options: {
      //...
    }
  }]
});

//server
app.listen(process.env.PORT, () => {
    console.log("server is running on port 3000");
})