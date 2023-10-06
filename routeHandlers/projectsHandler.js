var Promise = require("bluebird");
var sql = Promise.promisifyAll(require("mssql"));
var dbConfig = require('../config/database');

var ProjectsHandler = function () {
    this.add = add;
    this.getAll = getAll;
    this.getByClient = getByClient;  
    this.getInactiveProjectsClient=getInactiveProjectsClients;  
    this.getActiveProjectsClients=getActiveProjectsClients;
    this.getInactiveProjectsInactiveClients=getInactiveProjectsInactiveClients;
};


function add(req, res) {
    let project = req.body;
    if (!project) {
      return res
        .status(401)
        .json({ status: "error", statusCode: "401", message: "Please fill all fields" });
    }
    return new sql.ConnectionPool(dbConfig.url)
      .connect()
      .then((pool) => {
        return pool
          .request()
          .input("id", sql.Int, project.Id)
          .input("name", sql.VarChar(sql.MAX), project.Name)
          .input("createdId", sql.Int, project.CreatedId)
          .input("description", sql.VarChar(sql.MAX), project.Description)
          .input("clientId", sql.Int, project.ClientId)
          .input("statusId", sql.Bit, project.StatusId)
          .input("projectType", sql.VarChar(sql.MAX), project.ProjectType) // Add the 'projectType' parameter here
          .output("InsertedId", sql.Int)
          .execute("AddProjects");
      })
      .then((result) => {
        if (result.returnValue == 406) {
          return res
            .status(500)
            .json({ status: "error", statusCode: "406", message: result });
        } else {
          return res
            .status(200)
            .json({ status: "success", statusCode: "200", recordset: result.recordset });
        }
      })
      .catch((err) => {
        console.error(err); // Log the error for debugging purposes
        return res
          .status(500)
          .json({ status: "error", statusCode: "500", message: "Internal server error" });
      });
  }
  
  // Rest of the code remains the same
  

function getAll(req, res) {
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request().execute('GetAllActiveProjects')
    }).then(result => {
        res.status(200).json({ status: "success", projects: result.recordset });
    }).catch(err => {
        res.status(500).json({ projects: JSON.stringify(err) });
    });
}

function getByClient (req, res) {
    let ClientId = req.params ? req.params.ClientId : null;
    //debugger;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
        .input('clientId', sql.Int, ClientId)
        .execute('GetProjectsByClient')
    }).then(result => {
        res.status(200).json({ status: "success", projects: result.recordset });
    }).catch(err => {
        res.status(500).json({ clients: 'Internal server error' });
    });
}

function getInactiveProjectsClients(_, res) {
  return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
      return pool.request().execute('getInactiveProjectsClients')
  }).then(result => {
      res.status(200).json({ status: "success", projects: result.recordset });
  }).catch(err => {
      res.status(500).json({ projects: JSON.stringify(err) });
  });
}
function getActiveProjectsClients(_, res) {
  return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
      return pool.request().execute('getActiveProjectsClients')
  }).then(result => {
      res.status(200).json({ status: "success", projects: result.recordset });
  }).catch(err => {
      res.status(500).json({ projects: JSON.stringify(err) });
  });
}
function getInactiveProjectsInactiveClients(_, res) {
  return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
      return pool.request().execute('getInactiveProjectsInactiveClients')
  }).then(result => {
      res.status(200).json({ status: "success", projects: result.recordset });
  }).catch(err => {
      res.status(500).json({ projects: JSON.stringify(err) });
  });
}
module.exports = ProjectsHandler;