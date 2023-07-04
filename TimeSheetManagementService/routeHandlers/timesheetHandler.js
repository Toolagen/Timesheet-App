
var Promise = require("bluebird");
var sql = Promise.promisifyAll(require("mssql"));
var dbConfig = require('../config/database');


var TimesheetHandler = function () {
    this.add = add;
    this.getAllData = getAllData;
    this.getDataByDate = getDataByDate;
    this.deleteTimesheet = deleteTimesheet;
    this.getDataByfromtoDate = getDataByfromtoDate;
    this.getAllTimesheetDataByDateRange = getAllTimesheetDataByDateRange;
    this.getDataByfromDate = getDataByfromDate; // NEW
    this.addMultipleRows = addMultipleRows;  //NEW
    this.deleteTimesheetEntries = deleteTimesheetEntries;  //NEW
};

function add(req, res) {
    //debugger;
    let timesheet = req.body;
    if (!timesheet) {
        res.status(401).json({ status: "error", statusCode: "401", message: "Please fill all fields" });
    }
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('id', sql.Int, timesheet.Id)
            .input('date', sql.DateTime, new Date(timesheet.Date))
            .input('hours', sql.Decimal(10, 2), timesheet.Hours)
            .input('comments', sql.VarChar(sql.MAX), timesheet.Comments)
            .input('isBillable', sql.Bit, timesheet.IsBillable)
            .input('createdId', sql.Int, timesheet.CreatedId)
            .input('projectId', sql.Int, timesheet.ProjectId)
            .input('jobId', sql.Int, timesheet.JobId)
            .input('clientId', sql.Int, timesheet.ClientId)
            .execute('TimesheetUpsert')
    }).then(result => {        
         if (result.returnValue == 406){
            res.status(500).json({ status: "error", statusCode: "406", message: result });
        } else {
            res.status(200).json({ status: "success", statusCode: "200", recordset : result});
        }
    })
        .catch(err => {
            res.status(500).json({ status: "error", statusCode: "500", message: err });
        })
}

//----------------------------NEW---------------------
function addMultipleRows(req, res) {
    let timesheetEntries = req.body;
    if (!timesheetEntries) {
        res.status(401).json({ status: "error", statusCode: "401", message: "Please fill all fields" });
    }

    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return Promise.all(timesheetEntries.map(function (timesheet) {
            return pool.request()
                .input('id', sql.Int, timesheet.Id)
                .input('date', sql.DateTime, new Date(timesheet.Date))
                .input('hours', sql.Decimal(10, 2), timesheet.Hours)
                .input('comments', sql.VarChar(sql.MAX), timesheet.Comments)
                .input('isBillable', sql.Bit, timesheet.IsBillable)
                .input('createdId', sql.Int, timesheet.CreatedId)
                .input('projectId', sql.Int, timesheet.ProjectId)
                .input('jobId', sql.Int, timesheet.JobId)
                .input('clientId', sql.Int, timesheet.ClientId)
                .execute('TimesheetUpsert');
        }));
    }).then(result => {
        res.status(200).json({ status: "success", statusCode: "200", rowsAffected: result });
        //debugger;
    })
        .catch(err => {
            res.status(500).json({ status: "error", statusCode: "500", message: "Oops!..Something went wrong" });
        });
}
//----------------------------------------------

function getAllData(req, res) {
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request().execute('GetTimesheetGridData')
    }).then(result => {
        res.status(200).json({ status: "success", timesheets: result.recordset });
    }).catch(err => {
        res.status(500).json({ jobs: 'Internal server error' });
    });
}

function getDataByDate(req, res) {
    let WorkDate = req.params ? req.params.workdate : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('date', sql.VarChar, WorkDate)
            .execute('GetTimesheetGridDataByDate')
    }).then(result => {
        res.status(200).json({ status: "success", timesheets: result.recordset });
    }).catch(err => {
        res.status(500).json({ jobs: 'Internal server error' });
    });
}


function getDataByfromtoDate(req, res) {
    let createdId = req.params ? req.params.createdId : null;
    let fromDate = req.params ? req.params.fromDate : null;
    let toDate = req.params ? req.params.toDate : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('createdid', sql.Int, createdId)
            .input('fromdate', sql.VarChar, fromDate)
            .input('todate', sql.VarChar, toDate)
            .execute('GetTimesheetGridDataByfromtoDate')
    }).then(result => {
        res.status(200).json({ status: "success", timesheets: result.recordset });
    }).catch(err => {
        res.status(500).json({ jobs: 'Internal server error' });
    });
}

//NEW------------------------------
function getDataByfromDate(req, res) {
    let fromDate = req.params ? req.params.fromDate : null;
    let createdId = req.params ? req.params.createdId : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('FromDate', sql.VarChar, fromDate)
            .input('CreatedId', sql.Int, createdId)
            .execute('GetOneWeekTimeSheetData')
    }).then(result => {
        res.status(200).json({ status: "success", timesheets: JSON.parse(result.recordset[0].weekreport) });
    }).catch(err => {
        res.status(500).json({ jobs: 'Internal server error' });
    });
}
//-----------------------------------

// function getDataByDateAndUser(req, res){
//     let WorkDate = req.params ? req.params.workdate : null;
//     let UserId = req.params ? req.params.userid : null;
//     return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
//         return pool.request()
//         .input('date', sql.VarChar, WorkDate)
//         .input('userId', sql.VarChar, UserId)
//         .execute('GetTimesheetGridDataByDateAndUser')
//     }).then(result => {
//         res.status(200).json({ status: "success", timesheets: result.recordset });
//     }).catch(err => {
//         res.status(500).json({ jobs: 'Internal server error' });
//     });
// }

//-------------NEW----------------------------
function deleteTimesheetEntries(req, res) {
    let DeleteEntries = req.body;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return Promise.all(DeleteEntries.map(function (id) {
            return pool.request()
                .input('id', sql.Int, id)
                .execute('DeleteTimeSheet');
        }));
    }).then(result => {
        res.status(200).json({ status: "success", statusCode: "200", rowsAffected: result });
    }).catch(err => {
        res.status(500).json({ status: "error", statusCode: "500", message: "Oops!..Something went wrong" });
    });
}
//--------------------------------------------

function deleteTimesheet(req, res) {
    //debugger;
    let id = req.params ? req.params.id : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('id', sql.Int, id)
            .execute('DeleteTimeSheet')
    }).then(result => {
        res.status(200).json({ status: "success", statusCode: "200", rowsAffected: result.rowsAffected.length });
    }).catch(err => {
        res.status(500).json({ status: "error", statusCode: "500", message: "Oops!..Something went wrong" });
    });
}


function getAllTimesheetDataByDateRange(req, res) {
    let fromReportDate = req.params ? req.params.fromReportDate : null;
    let toReportDate = req.params ? req.params.toReportDate : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('fromReportDate', sql.VarChar, fromReportDate)
            .input('toReportDate', sql.VarChar, toReportDate)
            .execute('GetAllTimesheetDataByDateRange')
    }).then(result => {
        res.status(200).json({ status: "success", timesheets: result.recordset });
    }).catch(err => {
        res.status(500).json({ jobs: 'Internal server error' });
    });
}


module.exports = TimesheetHandler;