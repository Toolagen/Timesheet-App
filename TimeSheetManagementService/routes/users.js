var express = require('express');
var router = express.Router();
var UsersHandler = require('../routeHandlers/usersHandler')

var usersHandler = new UsersHandler();

//router.get('/getAll', usersHandler.getAll);
router.get('/getByUserEmail/:UserEmail', usersHandler.getByUserEmail);
router.get('/getAll',usersHandler.getAllUsers);
module.exports = router;