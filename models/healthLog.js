module.exports = (sequelize, DataTypes) => {
    const healthLogs = sequelize.define("Health_Log", {
        Card_No: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        Visit_No:{
            type:DataTypes.BIGINT(20),
            primaryKey: true

        },
        Visit_Date:{
            type: DataTypes.STRING,
            allowNull:false
        },
        BP:{
            type: DataTypes.STRING,
        },
        Pulse:{
            type: DataTypes.STRING,
        },
        Temperature:{
            type: DataTypes.STRING,
        },
        Symptoms_Exp:{
            type: DataTypes.TEXT,
        },
        Diagnosis:{
            type: DataTypes.TEXT,
        }
    },
    {
        initialAutoIncrement: 14001
    }
    )
    return healthLogs;

}