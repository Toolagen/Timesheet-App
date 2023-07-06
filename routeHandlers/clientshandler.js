var Promise = require("bluebird");
var sql = Promise.promisifyAll(require("mssql"));
var dbConfig = require('../config/database');

var ClientsHandler = function () {
    this.getAll = getAll;
    this.add = add;
};

function add(req, res) {
    //debugger;
    let client = req.body;
    if (!client) {
        res.status(401).json({ status: "error", statusCode: "401", message: "Please fill all fields" });
    }
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
            .input('id', sql.Int, client.Id)                        
            .input('name', sql.VarChar(sql.MAX), client.Name)            
            .input('description', sql.VarChar(sql.MAX), client.Description)
            .input('statusId', sql.Bit, client.StatusId)
            .input('createdId', sql.Int, client.CreatedId)     
            .output('InsertedId', sql.Int)       
            .execute('AddClients')
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
        return pool.request().execute('GetAllClients')
    }).then(result => {
        res.status(200).json({ status: "success", clients: result.recordset });        
    }).catch(err => {
        res.status(500).json({ clients: JSON.stringify(err) });        
    });
}

module.exports = ClientsHandler;