let users = require('./users');
module.exports = (sequelize, DataTypes) => {
    const doctors = sequelize.define("Doctor", {
        D_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        Full_Name:{
            type:DataTypes.STRING

        },
        D_Address:{
            type: DataTypes.STRING
        },
        Contact:{
            type: DataTypes.STRING
        },
        Avl_Days:{
            type: DataTypes.STRING
        },
        Avl_Time:{
            type: DataTypes.STRING
        },
        Dept_Name:{
            type: DataTypes.STRING
        },
        Reg_No:{
            type: DataTypes.STRING
        },
        Years_of_Exp:{
            type: DataTypes.BIGINT(20)
        },
        // U_ID:{
        //     type: DataTypes.BIGINT(20),
        //     // references: {
        //     //     model: 'users',
        //     //     key: 'U_ID'
        //     // },
        // },
    },
    {
		initialAutoIncrement: 1201
	})
    // doctors.associate = (models) => {
    //     doctors.belongsTo(users, { as: 'UserID'})
    // }
    return doctors;
}
