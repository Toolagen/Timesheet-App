var express = require('express');
var router = express.Router();
var ProjectsHandler = require('../routeHandlers/ProjectsHandler')

var projectsHandler = new ProjectsHandler();

router.post('/add', projectsHandler.add);
router.get('/getAll', projectsHandler.getAll);
router.get('/getByClient/:ClientId', projectsHandler.getByClient);

module.exports = router;
