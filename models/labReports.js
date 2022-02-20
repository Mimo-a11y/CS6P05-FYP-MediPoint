
module.exports = (sequelize, DataTypes) => {
    const labReports = sequelize.define("Lab_Report", {
        Report_ID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
        Test_Pay_Status:{
            type: DataTypes.ENUM('Paid','Unpaid', 'N/A'),
        },
        Test_Done:{
            type: DataTypes.ENUM('Yes', 'No', 'N/A')
        }
        
    },
    )
    return labReports;
}
