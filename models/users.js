module.exports = (sequelize, DataTypes) => {
    const users = sequelize.define("User", {
        U_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        Email:{
            type: DataTypes.STRING,
            unique: true
        },
        Password:{
            type: DataTypes.STRING
        },
        User_Type:{
            type: DataTypes.ENUM('Patient','Doctor','Clinic')
        }
    },
    {
		initialAutoIncrement: 1101
	})
    // users.associate = (models) => {
    //     users.belongsTo(models.doctorUsers, { through: models.doctorUsers, foreignKey: 'U_ID'});
    // }
    return users;

}