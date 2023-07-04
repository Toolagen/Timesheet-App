var Promise = require("bluebird");
var sql = Promise.promisifyAll(require("mssql"));
var dbConfig = require('../config/database');

var JobsHandler = function () {
    this.add = add;
    this.getAll = getAll;
    this.getByProject = getByProject;
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

module.exports = JobsHandler;