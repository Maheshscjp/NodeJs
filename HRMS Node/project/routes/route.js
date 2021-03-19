const express = require('express');
const router = express();
var dbconnect = require('../dbconnection');
const bodyparser = require('body-parser');
router.use(bodyparser());
var dateFormat = require('dateformat');
var email = require('../utils/sendMail');
var constants = require('../constants/constants');
const service = require('../utils/services');
const bycrpt = require('bcrypt');

router.post('/authenticate', (req, res, next) => {
    console.log(req.body);
    body = req.body
    if (!body['empCode'] || body['empCode'] == null) {
        res.status(206).json({
            success: false,
            message: 'empCode Id cannot be blank'
        })
        return false;
    }
    if (!body['password'] || body['password'] == null) {
        res.status(206).json({
            success: false,
            message: 'Password cannot be blank'
        })
        return false;
    }
    empCode = body['empCode'];

    password = body['password'];

    dbconnect.query("select * from login_fetch_v where emp_code='" + empCode + "'", (err, rows, fields) => {

        if (!err) {
            userData = rows['rows'];
            console.log(userData+" "+password);
            if (userData && userData.length > 0) {

                var match = bycrpt.compareSync(password, userData[0].password);
                if (match) {
                    console.log('match');
                    res.status(200).json({
                        success: true,
                        message: 'success',
                        data: userData[0]

                    });
                    return true;

                }

                else {
                    console.log('has not match');
                    res.status(206).json({
                        success: false,
                        message: 'failed'
                    });

                    return false;
                }


            }
            else {
                res.status(206).json({
                    success: false,
                    message: 'email id not registered.'
                });
                return false;
            }

        }
        else {
            console.log("error......");
            console.log(err);
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;
        };

    });
})


// router.post('/authenticate', (req, res, next) => {
//     console.log(req.body);
//     body = req.body
//     if (!body['empCode'] || body['empCode'] == null) {
//         res.status(206).json({
//             success: false,
//             message: 'empCode Id cannot be blank'
//         })
//         return false;
//     }
//     if (!body['password'] || body['password'] == null) {
//         res.status(206).json({
//             success: false,
//             message: 'Password cannot be blank'
//         })
//         return false;
//     }
//     empCode = body['empCode'];

//     password = body['password'];
//     var query = "select * from employee_master where token='" + empCode + "'and password='"+password+"'";
//     console.log("Query :: ",query);
//     dbconnect.query(query, (err, rows, fields) => {

//         if (!err) {
//             userData = rows[0];
//             console.log(userData);
//             if (userData!=null && userData!=undefined) {
//                       console.log('match');
//                     res.status(200).json({
//                         success: true,
//                         message: 'success',
//                         data: userData

//                     });
//                     return true;

//                 }

//                 else {
//                     console.log('has not match');
//                     res.status(206).json({
//                         success: false,
//                         message: 'failed'
//                     });

//                     return false;
//                 }

//         }
//         else {
//             console.log("error......");
//             console.log(err);
//             res.json({
//                 success: false,
//                 message: 'error while fetching data',
//                 errorCode: err['code']
//             })
//             return false;
//         };

//     });
// })



router.post('/register', (req, res, next) => {
    console.log(req.body);
    body = req.body
    console.log('----------------------------------------------------->');
    var joingDate = dateFormat(new Date(body['joiningDate']), 'mm/dd/yyyy');
    var dob = dateFormat(new Date((body['dob'])), 'mm/dd/yyyy');
    //var encPass = service.generateHash(body['password']);
    var encryptPass = bycrpt.hashSync(body['password'], bycrpt.genSaltSync(9));
    console.log(encryptPass);
    console.log('----------------------------------------------------->');
    var query = "INSERT INTO user_details(user_id, firstname, lastname, email, password, dob, tl_id, role, created, updated, isactive, joining_Dt, gender, contact_no, emp_code, aadhar_no, pan_no , warehouse_master_id, working_shift_id) VALUES (get_uuid(),'" + body['firstName'] + "','" + body['lastName'] + "','" + body['email'] + "','" + encryptPass + "','" + dob + "','" + body['tlId'] + "','" + body['role'] + "',now(), now(),'" + body['isActive'] + "','" + joingDate + "','" + body['gender'] + "','" + body['contactNo'] + "','" + body['empCode'] + "','" + body['aadharNo'] + "','" + body['panNo'] + "',(select warehouse_master_id from  warehouse_master where warehouse_code ='" + body['warehouse'] + "'),'" + body['shift'] + "');";
    console.log(query);
    dbconnect.query(query, (err, rows, fields) => {
        console.log("error :: " + err);
        //console.log("error :: " + err['code']);
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
            });
            var mailOptions = {
                from: constants.FromMailId,
                to: body['email'],
                subject: constants.SubjectUserRegMail,
                text: constants.MailBodyUserReg
            };
            email.sendMailToUser(mailOptions);
            return true;
        }
        else if (err == 'error: duplicate key value violates unique constraint "user_details_email_key"') {
            console.log("InsertLeaveDetails," + body['employeeId'] + " approver not exist ::")
            res.status(206).json({
                success: false,
                message: 'Email ID already register',
                errorCode: err['code']
            })
            return false;
        }if (err == 'error: duplicate key value violates unique constraint "user_details_AadharUnique_key"') {
            console.log("InsertLeaveDetails," + body['employeeId'] + " approver not exist ::")
            res.status(206).json({
                success: false,
                message: 'Aadhar Number already register',
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


router.post('/getUser', (req, res, next) => {
    body = req.body
    console.log(body);
    if (!body['requiredUser'] || !body['requiredUser'] == null) {

        res.status(206).json({
            success: false,
            message: "Required User cannot be blank."
        })
        return false;

    }

    var query = "select user_id, upper(firstname) as firstname, upper(lastname) as lastname, role,tl_id from user_details where role in ('" + body['requiredUser'] + "') ORDER BY user_details.firstname";
    if (body['role'] || body['role']=='Manager'){
        query = "select user_id, upper(firstname) as firstname, upper(lastname) as lastname, role,tl_id from user_details where role in ('" + body['requiredUser'] + "') and tl_id='"+ body['user_id'] +"' ORDER BY user_details.firstname";
    }
//    dbconnect.query("select user_id, firstname, lastname, role from user_details where role in ('" + body['requiredUser'] + "') and isactive='Y'", (err, rows, fields) => {
console.log(query);
dbconnect.query(query, (err, rows, fields) => {
    console.log(err);
        if (!err) {
            console.log("rows.." + rows['rows']);
            res.status(200).json({
                success: true,
                message: 'success',
                data: rows['rows']
            });
            return true;
        }
        else {
            console.log("error......");
            console.log(err);
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;
        };
    });
})



router.post('/getUserDetailsByEmpName', (req, res, next) => {
    body = req.body
    console.log(body);
    if (!body['userID'] || !body['userID'] == null) {

        res.status(206).json({
            success: false,
            message: "userID cannot be blank."
        })
        return false;

    }
  
    const query = "SELECT * FROM get_user_details_v where user_id='" + body['userID'] + "';";
    console.log(query)
    dbconnect.query(query, (err, rows, fields) => {
console.log(err);
        if (!err) {
            console.log("rows.." + rows['rows']);
            res.status(200).json({
                success: true,
                message: 'success',
                data: rows['rows']
            });
            return true;
        }
        else {
            console.log("error......");
            console.log(err);
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;
        };
    });
})


router.post('/UpdateEmployeeDetails', (req, res, next) => {
    console.log('<----------------UpdateEmployeeDetails ---------------->');
    body = req.body
    console.log(req.body);
    if (!body['userId']|| body['userId']== null) {
        console.log('user id cannot be blank')
        res.status(206).json({
            success: false,
            message: 'user id cannot be blank'
        });
        return null;
    }

    if(!body['password']|| body['password']== null){

        console.log('password empty.');
        var query = "UPDATE user_details SET  firstname='" + body['firstName'] + "', lastname='" + body['lastName'] + "', email='" + body['email'] + "',  dob='" + body['dob'] + "',tl_id='" + body['tl_id'] + "', role='" + body['role'] + "', updated=now(), isactive='" + body['isactive'] + "',joining_dt='" + body['joining_dt'] + "', gender='" + body['gender'] + "', contact_no='" + body['contact_no'] + "', emp_code='" + body['emp_code'] + "',aadhar_no='" + body['aadhar_no'] + "',pan_no='" + body['pan_no'] + "' , warehouse_master_id= (select warehouse_master_id from warehouse_master where warehouse_code='"+body['warehouse']+"'), working_shift_id='"+body['shift']+"' WHERE user_id='" + body['userId'] + "';";
        console.log(query);
        dbconnect.query(query, (err, rows, fields) => {
         console.log(err);
         if (!err) {
             console.log("rows.." + rows['rows']);
             res.status(200).json({
                 success: true,
                 message: 'success'
             });
         }  else if (err == 'error: duplicate key value violates unique constraint "user_details_email_key"') {
            console.log("InsertLeaveDetails," + body['employeeId'] + " approver not exist ::")
            res.status(206).json({
                success: false,
                message: 'Email ID already register',
                errorCode: err['code']
            })
            return false;
        }else if (err == 'error: duplicate key value violates unique constraint "user_details_AadharUnique_key"') {
            console.log("InsertLeaveDetails," + body['employeeId'] + " approver not exist ::")
            res.status(206).json({
                success: false,
                message: 'Aadhar Number already register',
                errorCode: err['code']
            })
            return false;
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

    }
    else{
        console.log('password is not empty.');
        console.log("Password :: "+ body['password']);
        var encryptPass = bycrpt.hashSync(body['password'], bycrpt.genSaltSync(9));
        
    var query = "UPDATE user_details SET  firstname='" + body['firstName'] + "', lastname='" + body['lastName'] + "', email='" + body['email'] + "', password='" + encryptPass + "', dob='" + body['dob'] + "',tl_id='" + body['tl_id'] + "', role='" + body['role'] + "', updated=now(), isactive='" + body['isactive'] + "',joining_dt='" + body['joining_dt'] + "', gender='" + body['gender'] + "', contact_no='" + body['contact_no'] + "', emp_code='" + body['emp_code'] + "',aadhar_no='" + body['aadhar_no'] + "',pan_no='" + body['pan_no'] + "' , warehouse_master_id=(select warehouse_master_id from warehouse_master where warehouse_code='"+body['warehouse']+"'), working_shift_id='"+body['shift']+"' WHERE user_id='" + body['userId'] + "';";
	console.log(query);
    dbconnect.query(query, (err, rows, fields) => {
     console.log(err);
     if (!err) {
         console.log("rows.." + rows['rows']);
         res.status(200).json({
             success: true,
             message: 'success'
         });
     }  else if (err == 'error: duplicate key value violates unique constraint "user_details_email_key"') {
        console.log("InsertLeaveDetails," + body['employeeId'] + " approver not exist ::")
        res.status(206).json({
            success: false,
            message: 'Email ID already register',
           // errorCode: err['code']
        })
        return false;
    }else if (err == 'error: duplicate key value violates unique constraint "user_details_AadharUnique_key"') {
        console.log("InsertLeaveDetails," + body['employeeId'] + " approver not exist ::")
        res.status(206).json({
            success: false,
            message: 'Aadhar Number already register',
            errorCode: err['code']
        })
        return false;
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
    }

    
})


router.post('/deleteUser', (req, res, next) => {
    console.log(req.body);
    body = req.body
    if (!body['userId'] || body['userId'] == null) {
        res.status('206').json({
            success: false,
            message: "UserId cannot be blank"
        });
        return false;
    }
    var reason = null;
    if (!body['userId'] || body['userId'] == null || body['reason'] != null) {
        reason = JSON.stringify(body['userId']);
    }

    var query = "update user_details set isActive='N', delete_comment='" + reason + "', updated=now() where user_id='" + body['userId'] + "'; ";
    console.log(query)
    dbconnect.query(query, (err, rows, fields) => {
        console.log("error :: " + err);
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
            });
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
            console.log("error while deleting user :: ");
            res.json({
                success: false,
                message: 'error while deleting user',
                errorCode: err['code']
            })
            return false;
        };
    });
})




router.post('/resetpassword', (req, res, next) => {
    body = req.body
    console.log(body);
    if (!body['userId'] || !body['userId'] == null || !body['userPwd'] || !body['userPwd'] == null
        || !body['userNewPwd'] || !body['userNewPwd'] == null) {

        res.status(206).json({
            success: false,
            message: "userId , userPwd , userNewPwd  cannot be blank."
        })
        return false;

    }

    dbconnect.query("select * from user_details where user_id='" + body['userId'] + "'", (err, rows, fields) => {


        if (!err) {
            userData = rows['rows'];
            console.log(userData);
            if (userData && userData.length > 0) {

                var match = bycrpt.compareSync(body['userPwd'], userData[0].password);
                if (match) {

                    var encryptPass = bycrpt.hashSync(body['userNewPwd'], bycrpt.genSaltSync(9));

                    var updatePassQuery = "update user_details set password = '" + encryptPass +
                        "' where user_id = '" + body['userId'] + "'";
                    dbconnect.query(updatePassQuery, (err, rows, fields) => {
                        console.log('---------------333333333--------------->')
                        updateCount = rows["rowCount"]
                        console.log(updateCount);
                        console.log('---------------444444444--------------->')
                        if (!err) {
                            if (updateCount > 0) {

                                res.status(200).json({
                                    success: true,
                                    message: 'success'
                                });
                                return true;
                            }
                            else {
                                res.status(206).json({
                                    success: false,
                                    message: 'error while updating data'
                                });
                                return true;
                            }

                        }
                        else {
                            console.log(err);
                            res.json({
                                success: false,
                                message: 'error while updating data',
                                errorCode: err['code'],
                            });
                            return false;
                        }

                    });



                }

                else {
                    res.status(206).json({
                        success: false,
                        message: 'invalid current password'
                    });
                    return false;

                }


            }
            else {
                res.status(206).json({
                    success: false,
                    message: 'invalid user id'
                });
                return false;
            }

        }
        else {
            console.log("error......");
            console.log(err);
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;
        };


    });


})


function get_pass(email) {
    dbconnect.query("select user_id, firstname, lastname, role from user_details where role in ('100') and isactive='Y'", (err, rows, fields) => {
        console.log(err);
        if (!err) {
            console.log("rows.." + rows['rows']);
            res.status(200).json({
                success: true,
                message: 'success',
                data: rows['rows']
            });
            return true;
        }
        else {
            console.log("error......");
            console.log(err);
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;
        };
    });
}
    


//update password
router.post('/updatePassword', (req, res, next) => {
    body = req.body
    console.log(body);
    if (!body['userId'] || !body['userId'] == null || !body['userPwd'] || !body['userPwd'] == null
    || !body['userNewPwd'] || !body['userNewPwd'] == null
    ) {

        res.status(206).json({
            success: false,
            message: "userId , userPwd , userNewPwd  cannot be blank."
        })
        return false;

    }

    var updatePassQuery = "update user_details set password = '"+ body['userNewPwd'] +
              "' where user_id = '" + body['userId'] +"' and password = '"+ body['userPwd']+"'";
    dbconnect.query(updatePassQuery,(err, rows, fields) => {
        updateCount = rows["rowCount"]
        console.log(updateCount);
        if (!err) {
                    if (updateCount > 0) {
                    
                        res.status(200).json({
                            success: true,
                            message: 'success'
                        });
                        return true;   
                    }
                    else{
                        res.status(200).json({
                            success: false,
                            message: 'incorrect current password'
                        });
                        return true;
                    }

                }
                else{             
                    console.log(err);
                    res.json({
                         success: false,
                         message: 'error while updating data',
                         errorCode: err['code'],
                    });
                    return false;
                }
           
            });
        
    })

    router.get('/getWarehouseMaster', (req, res, next) => {
        
        dbconnect.query("select * from warehouse_master where isactive='Y'", (err, rows, fields) => {
            console.log('error :: ' + err)
    
            if (!err) {
    
                var length = rows.rows.length;
                console.log('rows :: ' + length);
    
                if (length == 0) {
                    res.status(200).json({
                        success: true,
                        message: 'No Warehouse Data Found'
    
    
                    });
                    return true;
    
                }
    
                else {
                    res.status(200).json({
                        success: true,
                        message: 'success',
                        data: rows['rows']
    
    
                    });
                    return true;
                }
    
    
    
            }
            else {
    
                res.status(206).json({
                    success: false,
                    message: 'failed'
    
                });
                return false;
    
            }
        });
    })

    router.get('/getShiftList', (req, res, next) => {

        dbconnect.query("select * from working_shift where isactive='Y'", (err, rows, fields) => {
            console.log('error :: ' + err)
    
            if (!err) {
    
                var length = rows.rows.length;
                console.log('rows :: ' + length);
    
                if (length == 0) {
                    res.status(200).json({
                        success: true,
                        message: 'No Shift Data Found'
                    });
                    return true;
    
                }
    
                else {
                    res.status(200).json({
                        success: true,
                        message: 'success',
                        data: rows['rows']
    
    
                    });
                    return true;
                }
    
    
    
            }
            else {
    
                res.status(206).json({
                    success: false,
                    message: 'failed'
    
                });
                return false;
    
            }
        });
    })
    
    
module.exports = router;