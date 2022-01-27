module.exports = (sequelize, DataTypes) => {
    const users = sequelize.define("User", {
        U_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        Full_Name:{
            type:DataTypes.STRING,
            allowNull:false

        },
        Email:{
            type: DataTypes.STRING,
            unique: true,
            allowNull:false
        },
        Password:{
            type: DataTypes.STRING,
            allowNull:false
        },
        User_Type:{
            type: DataTypes.ENUM('Patient','Doctor','Clinic'),
            allowNull:false
        }
    },
    {
		initialAutoIncrement: 1101
	})
    return users;

}