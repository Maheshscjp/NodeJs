const express = require('express');
const router = express();
var dbconnect = require('../dbconnection');
const bodyparser = require('body-parser');
var dateFormat = require('dateformat');
router.use(bodyparser());
const cors=require('cors');

router.use(cors());
router.post('/getAttendanceDetails', (req, res, next) => {
    body = req.body
    console.log(body);
    if (!body['employeeId']|| body['employeeId']== null) {
        console.log('employeeId cannot be blank')
        res.status(206).json({
            success: false,
            message: 'employeeId cannot be blank'
        });
        return null;
    }
    console.log('----------------------------------------------------->');
    if (body['role'] == 'Employee') {
    console.log('------------Employee-------------------------------->');
    dbconnect.query("SELECT attendance_details.employee_id,user_details.role,attendance_details.punch_in,attendance_details.punch_out,attendance_details.punch_in_flag,attendance_details.punch_out_flag FROM attendance_details INNER JOIN user_details ON attendance_details.approval_id = user_details.user_id where attendance_details.employee_id = ('" + body['employeeID'] + "') AND user_details.role=('" + body['role'] + "');", (err, rows, fields) => {
           console.log(err);
            if (!err) {
                attendanceData = rows['rows'];
                console.log(attendanceData);
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: attendanceData
                });
                return true;
            }
            else if (err['code'] == 23503) {
                console.log("AttendanceDetails," + body['employeeID']+ " approver not exist ::")
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
                    message: 'error while selecting data',
                    errorCode: err['code']
                })
                return false;
            };

            

        });
    }
    if (body['role'] == 'Manager') {
        console.log('----------------Manager---------------------------->');
        dbconnect.query("SELECT attendance_details.employee_id,user_details.role,attendance_details.punch_in,attendance_details.punch_out,attendance_details.punch_in_flag,attendance_details.punch_out_flag FROM attendance_details INNER JOIN user_details ON attendance_details.approval_id = user_details.user_id where attendance_details.employee_id = ('" + body['employeeID'] + "') OR user_details.role=('" + body['role'] + "') OR user_details.tl_id=('" + body['employeeID'] + "');", (err, rows, fields) => {
               console.log(err);
                if (!err) {
                    attendanceData = rows['rows'];
                    console.log(attendanceData);
                    res.status(200).json({
                        success: true,
                        message: 'success',
                        data: attendanceData
                    });
                    return true;
                }
                else if (err['code'] == 23503) {
                    console.log("AttendanceDetails," + body['employeeID']+ " approver not exist ::")
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
                        message: 'error while selecting data',
                        errorCode: err['code']
                    })
                    return false;
                };
    
                
    
            });
        }
       
    if (body['role'] == 'Admin') {
        console.log('---------------------Admin--------------------------->');
        dbconnect.query("SELECT attendance_details.employee_id,user_details.role,attendance_details.punch_in,attendance_details.punch_out,attendance_details.punch_in_flag,attendance_details.punch_out_flag FROM attendance_details INNER JOIN user_details ON attendance_details.approval_id = user_details.user_id;", (err, rows, fields) => {
               console.log(err);
                if (!err) {
                    attendanceData = rows['rows'];
                    console.log(attendanceData);
                    res.status(200).json({
                        success: true,
                        message: 'success',
                        data: attendanceData
                    });
                    return true;
                }
                else if (err['code'] == 23503) {
                    console.log("AttendanceDetails," + body['employeeID']+ " approver not exist ::")
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
                        message: 'error while selecting data',
                        errorCode: err['code']
                    })
                    return false;
                };
    
                
    
            });
        }   
})

router.post('/UpdateAttendanceDetails', (req, res, next) => {
    body = req.body
    if (!body['punchOut']|| body['punchOut']== null) {
        console.log('punch Out cannot be blank')
        res.status(206).json({
            success: false,
            message: 'punch Out cannot be blank'
        });
        return null;
    }
    if (!body['employeeId']|| body['employeeId']== null) {
        console.log('employee Id Out cannot be blank')
        res.status(206).json({
            success: false,
            message: 'employee Id Out cannot be blank'
        });
        return null;
    }
    console.log('<----------------UpdateAttendanceDetails---------------->');
    var query = "UPDATE attendance_details SET punch_out='"+body['punchOut']+"',punch_out_flag='Y',updated=now() WHERE employee_id='" + body['employeeId'] + "';";
    // var query = "update leave_details set tl_comment=null , approved=null, "
    dbconnect.query(query, (err, rows, fields) => {
        console.log(err);
        if (!err) {
            console.log("rows.." + rows['rows']);
            res.status(200).json({
                success: true,
                message: 'success'
            });
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
router.post('/insertAttendanceDetails', (req, res, next) => {
    console.log(req.body);
    body = req.body
    var empID=body['employeeId'];
    console.log(empID);
    if (!body['employeeId']|| body['employeeId']== null) {
        console.log('employeeId cannot be blank')
        res.status(206).json({
            success: false,
            message: 'employeeId cannot be blank'
        });
        return null;
    }
    console.log('--------------------------insertAttendanceDetails--------------------------->');
    var query = "INSERT INTO attendance_details(attendance_id, employee_id, punch_in, punch_out, punch_in_flag,punch_out_flag, approval_id, created, updated) VALUES (get_uuid(),'" + body['employeeId'] + "', '"+body['punchIn']+"',null,'Y','N','"+body['approvalId']+"',now(), now());";
    console.log(query);
    dbconnect.query(query, (err, rows, fields) => {
        console.log("error :: " + err);
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
            });
            return true;
        }
        else if (err['code'] == 23505) {
            console.log("InsertAttendanceDetails," + body['employeeId'] + " approver not exist ::")
            res.status(206).json({
                success: false,
                message: 'Email ID already register',
                errorCode: err['code']
            })
            return false;
        }
        else {
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

module.exports = router;