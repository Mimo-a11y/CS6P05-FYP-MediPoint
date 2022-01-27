module.exports = (sequelize, DataTypes) => {
    const patients = sequelize.define("Patient", {
        P_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true
          },
        P_Address:{
            type: DataTypes.STRING,
            allowNull:false
        },
        Phone:{
            type: DataTypes.BIGINT(20),
            allowNull:false
        },
        Age:{
          type: DataTypes.INTEGER,
          allowNull:false
      },
        Gender:{
        type: DataTypes.STRING,
        allowNull:false
      },
    },
    {
      initialAutoIncrement: 1301
    }
)
    return patients;

}