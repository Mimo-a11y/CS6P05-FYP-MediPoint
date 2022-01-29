module.exports = (sequelize, DataTypes) => {
    const patientSymptomsDetails = sequelize.define("Patient_Symptoms_Detail", {
        Symptom_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        Symptom:{
            type:DataTypes.STRING,
            allowNull:false

        },
        Symptom_Time:{
            type: DataTypes.STRING,
            allowNull:false
        },
        Symptom_Date:{
            type: DataTypes.STRING,
            allowNull:false
        },
    },
    )
    return patientSymptomsDetails;

}