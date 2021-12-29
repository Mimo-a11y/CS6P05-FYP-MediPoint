const {check} = require('express-validator'); //importing check function from express-validator

let validateSignUp = [
    check("email", "Invalid Email").isEmail().trim(),
    check("password", "Invalid Password. The password must be atleast 2 characters long").isLength({min: 2}),
    check("Cpassword", "Password confirmation does not match the password")
    .custom((value, { req }) => {
        return value === req.body.password
    }
    )
];

module.exports = {validateSignUp};
