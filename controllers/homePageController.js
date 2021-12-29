let getHomePage = (req,res) => {
        if(req.user.User_Type === "Patient"){
            res.status(200).render('patientHomePage', {
                user: req.user
            });
        }
        else if(req.user.User_Type === "Doctor"){
            res.status(200).render('doctorHomePage', {
                user: req.user
            });
        }
        else if(req.user.User_Type === "Clinic"){
            res.status(200).render('clinicHomePage', {
                user: req.user
            });
        }
        console.log(req.user.User_Type);
}


module.exports = {
    getHomePage
}