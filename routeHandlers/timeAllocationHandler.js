var Promise = require("bluebird");
var sql = Promise.promisifyAll(require("mssql"));
var dbConfig = require('../config/database');

var TimeAllocationHandler = function () {
    this.addAllocationDetails = addAllocationDetails;    
    this.getAllocationDetails = getAllocationDetails;
    this.deleteAllocationDetails = deleteAllocationDetails;
    //this.getAllocationHistory = getAllocationHistory;
    this.getTimesheet = getTimesheet;
    
};

function addAllocationDetails(req, res) {   
    let operation = req.params ? req.params.operation : "";
    let timeAllocation = req.body;
    if (!timeAllocation) {
        res.status(401).json({ status: "error", statusCode: "401", message: "Please fill all fields" });
    }
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('id', sql.Int, timeAllocation.Id)
            .input('clientId', sql.Int, timeAllocation.ClientId)
            .input('projectId', sql.Int, timeAllocation.ProjectId)
            .input('hoursAllocated', sql.Decimal(10, 2), timeAllocation.HoursAllocated)            
            .input('date', sql.DateTime, new Date(timeAllocation.Date))                                    
            .input('createdId', sql.Int, timeAllocation.CreatedId)
            .input('operation', sql.VarChar, operation)                                    
            .execute('AddTimeAllocationDetails')
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

function getAllocationDetails(req, res) {
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request().execute('GetTimeAllocationDetails')
    }).then(result => {
        res.status(200).json({ status: "success", timeAllocation: result.recordset });        
    }).catch(err => {
        res.status(500).json({ timeAllocation: JSON.stringify(err) });        
    });
}

function getTimesheet(req, res) {
    let ClientId = req.params ? req.params.clientId : null;
    let ProjectId = req.params ? req.params.projectId : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
        .input('clientId', sql.Int, ClientId)
        .input('projectId', sql.Int, ProjectId)
        .execute('getTimesheet')
    }).then(result => {
        res.status(200).json({ status: "success", timeAllocation: result.recordset });        
    }).catch(err => {
        res.status(500).json({ timeAllocation: JSON.stringify(err) });        
    });
}

function deleteAllocationDetails(req, res) {
    //debugger;
    let id = req.params ? req.params.id : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('id', sql.Int, id)
            .execute('DeleteTimeAllocationDetails')
    }).then(result => {
        res.status(200).json({ status: "success", statusCode: "200", rowsAffected: result.rowsAffected.length });
    }).catch(err => {
        res.status(500).json({ status: "error", statusCode: "500", message: "Oops!..Something went wrong" });
    });
}


module.exports = TimeAllocationHandler;