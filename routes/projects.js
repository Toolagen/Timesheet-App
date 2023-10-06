var express = require('express');
var router = express.Router();
var ProjectsHandler = require('../routeHandlers/projectsHandler')

var projectsHandler = new ProjectsHandler();

router.post('/add', projectsHandler.add);
router.get('/getAll', projectsHandler.getAll);
router.get('/getByClient/:ClientId', projectsHandler.getByClient);
router.get('/getInactiveProjectsClients',projectsHandler.getInactiveProjectsClient)
router.get('/getActiveProjectsClients',projectsHandler.getActiveProjectsClients)
router.get('/getInactiveProjectsInactiveClients',projectsHandler.getInactiveProjectsInactiveClients)

module.exports = router;
