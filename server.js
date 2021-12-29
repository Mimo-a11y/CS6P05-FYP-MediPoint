//Importing packages
const Express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectFlash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

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

//enabe flash
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

//server
app.listen(process.env.PORT, () => {
    console.log("server is running on port 3000");
})