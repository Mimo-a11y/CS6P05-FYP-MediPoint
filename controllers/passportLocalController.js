const passport = require('passport');
const passportLocal = require('passport-local');
const loginService = require('../services/loginService');

let localStrategy = passportLocal.Strategy;

let initPassportLocal = () => {
    passport.use(new localStrategy({
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                let user = await loginService.findUserByEmail(email);
                //check if the user email exist or not
                if (!user) {
                    return done(null, false, req.flash("errors", `The user email ${email} does not exist`));
                }
                //if user exists
                if (user) {
                    //compare password
                    let match = await loginService.compareUserPassword(user, password);
                    if (match === true) {
                        return done(null, user, null);
                    } else {
                        return done(null, false, req.flash("errors", match));
                    }
                }

            } catch (err) {
                return done(null, false, err);
            }
        }));
};

//using serializer and deserializer

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    return done(null, user);
    // loginService.findUserById(id).then((user) => {
    //     return done(null,user);
    // }).catch((err) => {
    //     return done(err, null);
    // })
});

//exporting
module.exports = initPassportLocal;