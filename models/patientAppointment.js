module.exports = (sequelize, DataTypes) => {
    const patientAppointments = sequelize.define("Patient_Appointments", {
        Doctor_ID:{
            type: DataTypes.BIGINT(20),
            allowNull: false
        }
    }
)
    return patientAppointments;

}