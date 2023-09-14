var Promise = require("bluebird");
var sql = Promise.promisifyAll(require("mssql"));
var dbConfig = require('../config/database');

var JobsHandler = function () {
    this.add = add;
    this.getAll = getAll;
    this.getByProject = getByProject;
    this.deleteJobEntry=deleteJobEntry;
};

function add(req, res) {
    //debugger;
    let job = req.body;
    if (!job) {
        res.status(401).json({ status: "error", statusCode: "401", message: "Please fill all fields" });
    }
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('id', sql.Int, job.Id)                        
            .input('name', sql.VarChar(sql.MAX), job.Job)            
            .input('createdId', sql.Int, job.CreatedId)                  
            .input('projectId', sql.Int, job.ProjectId)
            .input('description', sql.VarChar(sql.MAX), job.Description)    
            .input('isBillable', sql.Bit, job.IsBillable) 
            .input('statusId', sql.Bit, job.StatusId)                                   
            .execute('Addjobs')
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

function getAll(req, res) {
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request().execute('GetAllJobs')
    }).then(result => {
        res.status(200).json({ status: "success", jobs: result.recordset });
    }).catch(err => {
        res.status(500).json({ jobs: 'Internal server error' });
    });
}

function getByProject(req, res) {
    let ProjectId = req.params ? req.params.ProjectId : null;
    //debugger;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
        .input('projectId', sql.Int, ProjectId)
        .execute('GetJobsByProject')
    }).then(result => {
        res.status(200).json({ status: "success", jobs: result.recordset });
    }).catch(err => {
        res.status(500).json({ projects: 'Internal server error' });
    });
}

function deleteJobEntry(req, res) {
    let id = req.params ? req.params.id : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('id', sql.Int, id)
            .execute('DeleteJob');
    }).then(result => {
        if (result.recordset.length > 0) {
            // A related Timesheet record with StatusId=1 exists, return the job ID.
            res.status(200).json({ status: "success", statusCode: "200", message: `Job with ID ${result.recordset[0].Id} is associated with an active Timesheet entry.` });
        } else if (result.returnValue === 0) {
            // No related Timesheet records found, and job was successfully deleted.
            res.status(200).json({ status: "success", statusCode: "200", message: "Job entry deleted" });
        } else {
            // The job deletion failed for some reason.
            res.status(500).json({ status: "error", statusCode: "500", message: "Failed to delete job entry" });
        }
    }).catch(err => {
        res.status(500).json({ status: "error", statusCode: "500", message: err });
    });
}



module.exports = JobsHandler;