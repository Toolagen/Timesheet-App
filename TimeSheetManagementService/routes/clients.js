var express = require('express');
var router = express.Router();
var ClientsHandler = require('../routeHandlers/clientshandler')

var clientsHandler = new ClientsHandler();

router.post('/add', clientsHandler.add);
router.get('/getAll', clientsHandler.getAll);

module.exports = router;
