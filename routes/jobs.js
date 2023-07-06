var express = require('express');
var router = express.Router();
var JobsHandler = require('../routeHandlers/JobsHandler')

var jobsHandler = new JobsHandler();

router.post('/add', jobsHandler.add);
router.get('/getAll', jobsHandler.getAll);
router.get('/getByProject/:ProjectId', jobsHandler.getByProject);

module.exports = router;