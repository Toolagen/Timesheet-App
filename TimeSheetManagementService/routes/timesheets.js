var express = require('express');
var router = express.Router();
var TimesheetHandler = require('../routeHandlers/timesheetHandler')

var timesheetHandler = new TimesheetHandler();

router.post('/add', timesheetHandler.add);
router.get('/getAllData', timesheetHandler.getAllData);
router.get('/getDataByDate/:workdate', timesheetHandler.getDataByDate)
router.get('/getDataByfromtoDate/:createdId/:fromDate/:toDate', timesheetHandler.getDataByfromtoDate)
router.get('/getAllDataByDateRange/:fromReportDate/:toReportDate',timesheetHandler.getAllTimesheetDataByDateRange)
//router.get('/getDataByDateAndUser/:workdate/:userid', timesheetHandler.getDataByDateAndUser)
router.delete('/deleteTimesheet/:id', timesheetHandler.deleteTimesheet)

router.get('/getDataByfromDate/:fromDate/:createdId', timesheetHandler.getDataByfromDate); //NEW
router.post('/addMultipleRows', timesheetHandler.addMultipleRows);   //NEW
router.post('/deleteTimesheetEntries', timesheetHandler.deleteTimesheetEntries);   //NEW

module.exports = router;
