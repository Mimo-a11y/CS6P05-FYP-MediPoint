
module.exports = (sequelize, DataTypes) => {
    const prescriptions = sequelize.define("Prescription", {
        Pres_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        Pres_No: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
        },
        Medicine_Name:{
            type: DataTypes.STRING,
        },
        Description:{
            type: DataTypes.TEXT,
        },
        Days:{
            type: DataTypes.INTEGER,
        },
        Duration:{
            type: DataTypes.INTEGER,
        },
        Received:{
            type: DataTypes.ENUM('Yes', 'No')
        }
        
    },
    {
		initialAutoIncrement: 1601
	})
    return prescriptions;
}