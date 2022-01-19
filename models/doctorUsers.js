module.exports = (sequelize, DataTypes) => {
    const doctorUsers = sequelize.define("User", {
        U_ID: {
            type: DataTypes.BIGINT(20),
            //primaryKey: true,
            references: {
              model: 'users',
              key: 'U_ID'
            },
          },
        D_ID: {
            type: DataTypes.BIGINT(20),
            //primaryKey: true,
            references: {
              model: 'doctors',
              key: 'D_ID'
            },
        }
    },
)
doctorUsers.associate = (models) => {
    doctorUsers.belongsTo(models.users, { foreignKey: 'U_ID', targetKey: 'U_ID', as: 'users' });
    doctorUsers.belongsTo(models.doctors, { foreignKey: 'D_ID', targetKey: 'D_ID', as: 'doctors' });
}
    return doctorUsers;

}