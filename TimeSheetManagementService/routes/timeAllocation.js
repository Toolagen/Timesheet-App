var express = require('express');
var router = express.Router();
var TimeAllocationHandler = require('../routeHandlers/timeAllocationHandler')

var timeAllocationHandler = new TimeAllocationHandler();

router.post('/addAllocationDetails/:operation', timeAllocationHandler.addAllocationDetails);
router.delete('/deleteAllocationDetails/:id', timeAllocationHandler.deleteAllocationDetails);
router.get('/getAllocationDetails', timeAllocationHandler.getAllocationDetails);
//router.get('/getAllocationHistory/:clientId/:projectId', timeAllocationHandler.getAllocationHistory);
router.get('/getTimesheet/:clientId/:projectId', timeAllocationHandler.getTimesheet);






module.exports = router;