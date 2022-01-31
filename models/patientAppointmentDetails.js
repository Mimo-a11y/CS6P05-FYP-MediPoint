module.exports = (sequelize, DataTypes) => {
    const patientAppointmentDetails = sequelize.define("Patient_Appointment_Detail", {
        App_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        App_Date:{
            type:DataTypes.STRING,
            allowNull:false

        },
        App_Time:{
            type: DataTypes.STRING,
            allowNull:false
        },
        App_Type:{
            type: DataTypes.ENUM('New','Follow-Up'),
            allowNull:false
        },
        Payment_Status:{
            type: DataTypes.ENUM('Paid','Unpaid'),
            allowNull:false
        }
    },
    )
    return patientAppointmentDetails;

}