var Promise = require("bluebird");
var sql = Promise.promisifyAll(require("mssql"));
var dbConfig = require('../config/database');

var UsersHandler = function () {
    //this.getAll = getAll;
    this.getByUserEmail = getByUserEmail;
    this.getAllUsers=getAllUsers;
};

function getByUserEmail(req, res){
    let UserEmail = req.params ? req.params.UserEmail : null;
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
        .input('userEmail', sql.VarChar(50), UserEmail)
        .execute('GetUserByEmail')
    }).then(result => {
        res.status(200).json({ status: "success", user: result.recordset });
    }).catch(err => {
        res.status(500).json({ projects: 'Internal server error' });
    });
}

function getAllUsers(req, res){
    return new sql.ConnectionPool(dbConfig.url).connect().then(pool => {
        return pool.request()
        .execute('GetAllUsers')
    }).then(result => {
        res.status(200).json({ status: "success", user: result.recordset });
    }).catch(err => {
        res.status(500).json({ projects: 'Internal server error' });
    });
}

module.exports = UsersHandler;