
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
            type: DataTypes.STRING,
        },
        Duration:{
            type: DataTypes.STRING,
        },
        Med_Pay_Status:{
            type: DataTypes.ENUM('Paid','Unpaid', 'N/A'),
        },
        Received:{
            type: DataTypes.ENUM('Yes', 'No', 'N/A')
        }
        
    },
    {
		initialAutoIncrement: 16001
	})
    return prescriptions;
}
