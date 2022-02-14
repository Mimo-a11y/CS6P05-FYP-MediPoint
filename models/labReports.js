
module.exports = (sequelize, DataTypes) => {
    const labReports = sequelize.define("Lab_Report", {
        Report_ID: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
            autoIncrement: true,
        },
        Test_No: {
            type: DataTypes.BIGINT(20),
            primaryKey: true,
        },
        Test_Name:{
            type: DataTypes.STRING,
        },
        File_Name:{
            type: DataTypes.STRING,
        },
        File_Data:{
            type: DataTypes.BLOB,
        },
        Test_Done:{
            type: DataTypes.ENUM('Yes', 'No')
        }
        
    },
    {
		initialAutoIncrement: 1501
	})
    return labReports;
}
