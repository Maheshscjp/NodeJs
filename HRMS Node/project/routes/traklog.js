const express = require('express');
const router = express();
var dbconnect = require('../dbconnection');
const bodyparser = require('body-parser');
router.use(bodyparser());

router.post('/AddLog', (req, res, next) => {
    console.log("Request",req.body);
    body = req.body
    console.log('-------------------------AddLog---------------------------->');
    var query = "INSERT INTO log_track(log_track_id, types_of_issue, task_id, staff_id, job_code, issue,created, updated, logged_in_staffid, status) VALUES (get_uuid(), '" + body['types_of_issue'] + "', '" + body['task_id'] + "','" + body['staff_id'] + "','" + body['job_code'] + "','" + body['issue'] + "',now(),now(), '" + body['logged_in_staffid'] + "','" + body['status'] + "');";
    console.log(query);
    dbconnect.query(query, (err, rows, fields) => {
        console.log("error :: " + err);
        //console.log("error :: " + err['code']);
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
            });
               return true;
      
        }else {
            console.log("error......");
            console.log(err);
            res.json({
                success: false,
                message: 'error while inserting data',
                errorCode: err['code']
            })
            return false;
        };
    });
})


router.get('/getAllIssueDetails', (req, res, next) => {
    console.log('-------------------->');
    console.log('getAllIssueDetails');

    dbconnect.query("select * from log_track", (err, rows, fields) => {
        console.log('error :: ' + err)

        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
                data: rows['rows']

            });
           
            return true;

        }
        else {

            res.status(206).json({
                success: false,
                message: 'failed'

            });
            return false;

        }
    });

});


module.exports = router;
