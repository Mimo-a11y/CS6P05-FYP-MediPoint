let users = require('./users');
module.exports = (sequelize, DataTypes) => {
    const doctors = sequelize.define("Doctor", {
        D_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        D_Address:{
            type: DataTypes.STRING,
            allowNull:false
        },
        Contact:{
            type: DataTypes.BIGINT(20),
            allowNull:false
        },
        Avl_Day:{
            type: DataTypes.STRING,
            allowNull:false
        },
        Avl_Time:{
            type: DataTypes.STRING,
            allowNull:false
        },
        Dept_Name:{
            type: DataTypes.STRING,
            allowNull:false
        },
        NMC_No:{
            type: DataTypes.INTEGER,
            allowNull:false
        },
        Years_of_Exp:{
            type: DataTypes.INTEGER,
            allowNull:false
        },
    },
    {
		initialAutoIncrement: 1201
	})
    return doctors;
}