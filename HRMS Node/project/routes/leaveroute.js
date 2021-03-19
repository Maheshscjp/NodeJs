const express = require('express');
const router = express();
var dbconnect = require('../dbconnection');
const bodyparser = require('body-parser');
var dateFormat = require('dateformat');
router.use(bodyparser());
var email = require('../utils/sendMail');
var constants = require('../constants/constants');

router.post('/leaveRegister', (req, res, next) => {
    body = req.body
    var toDate = dateFormat(new Date(body['toDate']), 'mm/dd/yyyy');
    var fromDate = dateFormat(new Date((body['fromDate'])), 'mm/dd/yyyy');
    dbconnect.query("select create_leave('" + body['employeeId'] + "','" + body['approverId'] + "','" + fromDate + "','" + toDate + "'," + body['pendingCount'] + ",'" + body['reason'] + "')",
        (err, rows, fields) => {
            console.log(err);
            if (!err) {
                console.log("rows.." + rows['rows']);
                res.status(200).json({
                    success: true,
                    message: 'success',
                });

                var query = "select * from user_details where user_id ='" + body['approverId'] + "';";
                
                dbconnect.query(query, (err, result) => {
                        var sendTo = result['rows'][0]['email'];
                        console.log(sendTo);
                        var mailOptions = {
                            from: constants.FromMailId,
                            to: sendTo,
                            subject: constants.SubjectLeaveRegMail,
                            text: constants.MailBodyLeaveReg
                        };
                        email.sendMailToUser(mailOptions);
                    })


                return true;
            }
            else if (err['code'] == 23503) {
                console.log("InsertLeaveDetails," + body['employeeId'] + " approver not exist ::")
                res.status(206).json({
                    success: false,
                    message: 'Approver Does not exist',
                    errorCode: err['code']
                })

                return false;
            }
            else {
                console.log("error......");
                console.log(err);
                res.status(206).json({
                    success: false,
                    message: 'error while inserting data',
                    errorCode: err['code']
                })
                return false;
            };
        });
})

router.post('/pendingLeave', (req, res, next) => {
    body = req.body
    console.log(body)
    if (!body['employee_id'] || body['employee_id'] == null) {

        res.status(206).json({
            success: false,
            message: 'Employee Id cannot be blank...'
        })
        return false;
    }
    dbconnect.query("select * from  getcount('" + req.body['employee_id'] + "')",
        (err, rows, fields) => {
            console.log(err);
            if (!err) {
                leaveCount = rows['rows'];
                console.log(leaveCount);
                if (leaveCount && leaveCount.length > 0) {
                    res.status(200).json({
                        success: true,
                        message: 'success',
                        data: leaveCount[0]
                    });
                    return true;
                }
                else {
                    res.status(200).json({
                        success: false,
                        message: 'failed'
                    });
                    return false;
                }

            }
            else {
                res.json({
                    success: false,
                    message: 'error while fetching count',
                    errorCode: err['code']
                })
                return false;
            };
        });
})


router.post('/getEmployeeLeaves', (req, res, next) => {
    console.log(req.body);
    body = req.body
    if (!body['employeeId'] || body['employeeId'] == null) {
        res.json({
            success: false,
            message: 'Employee Id Cannot be blank'
        })
        return false;
    }
    dbconnect.query("select * from pending_leave_v where approver_id='" + body['employeeId'] + "'", (err, rows, fields) => {
        if (!err) {
            leaveDetails = rows['rows'];
            if (leaveDetails && leaveDetails.length > 0) {
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: leaveDetails

                });
                return true;
            }
            else {
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: []
                });
                return false;
            }

        }
        else {
            console.log("error......");
            console.log(err);
            res.json({
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;
        };
    });
})



router.post('/getLeaveStatus', (req, res, next) => {
    console.log(req.body)
    if (!req.body['user_id'] || req.body['user_id'] == null) {
        res.status(206).json({
            success: false,
            "message": "User Id Cannot be blank"
        })
        return false;
    }

   var query="SELECT leave_id, employee_id, approver_id, from_date :: text, to_date :: text,\
    leave_count, pending_count, reason, tl_comment, user_comment, approved, created, updated from leave_details\
     where employee_id='" + [req.body['user_id']] + "'";

    /* var query="SELECT leave_id, employee_id, approver_id, from_date :: text, to_date :: text,\
     leave_count, pending_count, reason, tl_comment, user_comment, approved,created,\
     date_part('year',updated) from leave_details\
     where  employee_id='" + [req.body['user_id']] + "' AND date_part('year',updated)='" + [req.body['year']] + "'";*/
    console.log("Query :: "+query);
    dbconnect.query(query,(err, rows, fields) => {
            console.log(err);
            if (!err) {
                var leaves = rows['rows']
                console.log("hurrrree.......!!!!!!!!!!");
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: leaves

                });
            }
            else {
                console.log("error......");
                console.log(err);
                res.json({
                    success: false,
                    message: 'error while inserting data',
                    errorCode: err['code']
                });
            }

        });
})

router.post('/getLeaveByYear', (req, res, next) => {
    console.log(req.body)
    if (!req.body['user_id'] || req.body['user_id'] == null) {
        res.status(206).json({
            success: false,
            "message": "User Id Cannot be blank"
        })
        return false;
    }
    if (!req.body['year'] || req.body['year'] == null) {
        res.status(206).json({
            success: false,
            "message": "Year Cannot be blank"
        })
        return false;
    }

 /*   var query="SELECT leave_id, employee_id, approver_id, from_date :: text, to_date :: text,\
    leave_count, pending_count, reason, tl_comment, user_comment, approved, created, updated from leave_details\
     where employee_id='" + [req.body['user_id']] + "'";*/

     var query="SELECT leave_id, employee_id, approver_id, from_date :: text, to_date :: text,\
     leave_count, pending_count, reason, tl_comment, user_comment, approved,created,\
     date_part('year',updated) from leave_details\
     where  employee_id='" + [req.body['user_id']] + "' AND date_part('year',updated)='" + [req.body['year']] + "'";
    console.log("Query :: "+query);
    dbconnect.query(query,(err, rows, fields) => {
           
            if (!err) {
                var leaves = rows['rows']
                console.log("hurrrree.......!!!!!!!!!!");
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: leaves

                });
            }
            else {
                console.log("error......");
                console.log(err);
                res.json({
                    success: false,
                    message: 'error while inserting data',
                    errorCode: err['code']
                });
            }

        });
})


router.post('/updateLeaveReq', (req, res, next) => {
    body = req.body
    if (!body['leaveId'] || body['leaveId'] == null) {
        console.log('LeaveId cannot be blank')
        res.status(206).json({
            success: false,
            message: 'LeaveId cannot be blank'
        });
        return null;
    }
    var query = "update leave_details set tl_comment='" + body['tlComment'] + "', approved='" + body['isApproved'] + "', updated=now() where leave_id='" + body['leaveId'] + "';";
    dbconnect.query(query, (err, rows, fields) => {
        console.log(err);
        if (!err) {
            console.log("rows.." + rows['rows']);
            res.status(200).json({
                success: true,
                message: 'success'
            });

            var query = "select ud.email from leave_details ld left join user_details ud on ud.user_id = ld.employee_id where leave_id ='" + body['leaveId'] + "';";
                console.log(query);
                dbconnect.query(query, (err, result) => {
                    var sendTo = result['rows'][0]['email'];
                        console.log(sendTo);
                        var mailOptions = {
                            from: constants.FromMailId,
                            to: sendTo,
                            subject: constants.SubjectLeaveRegMail,
                            text: constants.MailBodyLeaveUpdate
                        };
                        email.sendMailToUser(mailOptions);
                    })
        }
        else {
            console.log("error......");
            console.log(err);
            res.json({
                success: false,
                message: 'error while Updating data',
                errorCode: err['code']
            });
        }

    });
})


module.exports = router;