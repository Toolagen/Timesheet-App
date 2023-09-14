var express = require('express');
var router = express.Router();
var JobsHandler = require('../routeHandlers/jobsHandler')

var jobsHandler = new JobsHandler();

router.post('/add', jobsHandler.add);
router.get('/getAll', jobsHandler.getAll);
router.get('/getByProject/:ProjectId', jobsHandler.getByProject);
router.post('/deleteJobEntry/:id', jobsHandler.deleteJobEntry);

module.exports = router;