const express = require('express');
const router = express();
var dbconnect = require('../dbconnection');
const bodyparser = require('body-parser');
router.use(bodyparser());
var dateFormat = require('dateformat');
var email = require('../utils/sendMail');
var constants = require('../constants/constants');
const service = require('../utils/services');
const randomize = require('randomatic');
const cors=require('cors');
const log4js = require('log4js');
const datetime = new Date();
log4js.configure({
    //appenders: { task: { type: "file", filename: "System.log" } },
    appenders: {
        task: { type: 'dateFile', filename: datetime.toISOString().slice(0,10) }
      },
    categories: {"default": { "appenders": ["task"], "level": "info" },
            "debug": { "appenders": ["task"], "level": "debug" },
            "result": { "appenders": ["task"], "level": "info" },
            "error": { "appenders": ["task"], "level": "ERROR" },
            "warn": { "appenders": ["task"], "level": "WARN" }
        }
  });

const logger = log4js.getLogger("task");
logger.level = "ALL";
router.use(cors());


router.post('/getAvailTask', (req, res, next) => {
    console.log('-------------------->');
    console.log('getAvailTask');
    body = req.body;
    console.log(body);
    if (body['isactive'] == 'Y') {
        query = "select * from product_master where isactive='Y'";
    }
    else {
        query = "select * from product_master where isactive='N'";
    }

    dbconnect.query(query, (err, rows, fields) => {
        console.log('error :: ' + err)

        if (!err) {

            var length = rows.rows.length;
            console.log('rows :: ' + length);

            if (length == 0) {
                res.status(200).json({
                    success: true,
                    message: 'No Task Found'


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

router.post('/assignTask', (req, res, next) => {
    console.log('--------------------->')
    console.log('assignTask')
    body = req.body
    console.log(body)
    send = false

    const warehouse = new String(body['warehouse']);
    const rack = new String(body['rack']);
    const level = new String(body['level']);
    const bin = new String(body['bin']);
    const loc = warehouse.concat('-', rack).concat('-', level).concat('-', bin);
    var user_id = '';

    if (body['is_sub_task'] == 'N') {
        user_id = body['user_id'];
    }

    var query = "select * from insert_task_assign('" + user_id + "','" + body['product_id'] + "','" + body['manager_id'] + "','" + body['task_type_id'] + "','" + body['task_description'] + "','" + body['is_sub_task'] + "', '" + loc + "');";

    console.log(query);
    dbconnect.query(query, (err, rows, fields) => {
        console.log("error :: " + err);
        if (!err && body['is_sub_task'] == 'N') {
            res.status(200).json({
                success: true,
                message: 'success',
            });
            return true;
        }
        else if (!err && body['is_sub_task'] == 'Y') {

            const assign_id = rows['rows'][0]['insert_task_assign'];
            console.log(assign_id);
            const product_id = body['product_id'];

            body['sub_task'].forEach(element => {

                var query = "select * from insert_sub_task_group('" + assign_id + "', '" + element['user_id'] + "','" + product_id + "','" + element["sub_task"] + "')";
                console.log(query)
                dbconnect.query(query, (err, rows, fields) => {

                    console.log('error :: ' + err)

                    if (!err) {
                        send = true
                    }

                    else {
                        send = false
                    }

                });

            });

            setTimeout(() => {


                console.log('send :: ' + send)

                if (send) {
                    res.status(200).json({
                        success: true,
                        message: 'success'


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
            }, 2000);
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

router.get('/getAllTaskForTrack', (req, res, next) => {

    console.log('----------------------------->')
    console.log('getAllTaskForTrack');
    dbconnect.query("select * from get_assigned_task_v", (err, rows, fields) => {

        console.log('error :: ' + err);

        if (!err) {

            length = rows['rows'].length;
            console.log('rows ::' + length)
            if (length == 0) {

                res.status(200).json({
                    success: true,
                    message: 'No Data Found'


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

router.post('/getAssignedTaskByUserId', (req, res) => {

    body = req.body
    if (!body['user_id'] || body['user_id'] == null) {

        console.log("User ID can't be null");
        res.json({
            success: false,
            message: "User ID can't be null"
        })
        return false;
    }

    var user_id = body['user_id'];

    console.log(user_id);
    var query = "select * from get_assigned_emp_task_v where user_id in ('" + user_id + "', '')";
    console.log(query);
    dbconnect.query(query, (err, rows, fields) => {
        console.log("error :: " + err);
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

router.post('/updateTaskDetails', (req, res) => {

    console.log("testing service...")
    body = req.body
    if (!body['assign_id'] || body['assign_id'] == null) {
        console.log("assign id can't be null");
        res.json({
            success: false,
            message: "assign id can't be null"
        })
        return false;
    }

    const assignId = body['assign_id'];
    const status = body['status'];
    var loc = '';
    var productId = '';
    if (status == "Completed") {
        loc = body['location'];
        productId = body['product_id'];
    }
    var query = "select * from update_assigned_task ('" + assignId + "','" + status + "','" + loc + "','" + productId + "')";
    console.log(query);
    dbconnect.query(query, (err, rows, fields) => {
        console.log("error :: " + err);
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success'
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

router.post('/getstatusCount', (req, res, next) => {

    console.log('----------------------------->')
    console.log('getstatusCount');

    body = req.body
    console.log(body);
    if (!body['user_id'] || body['user_id'] == null) {
        console.log('user_id  Out cannot be blank')
        res.status(206).json({
            success: false,
            message: 'user_id Out cannot be blank'
        });
        return null;
    }
    if (!body['role'] || body['role'] == null) {
        console.log('role  Out cannot be blank')
        res.status(206).json({
            success: false,
            message: 'user_id Out cannot be blank'
        });
        return null;
    }
    if (body['role'] == 'Employee') {
        var query = "select status,count(status) from task_assign where user_id='" + body['user_id'] + "' group by status ;"
        console.log(query);
        dbconnect.query(query, (err, rows, fields) => {
            console.log(err);
            if (!err) {
                console.log("rows.." + rows['rows']);
                statusData = rows['rows'];
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: statusData
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
    }
    if (body['role'] == 'Manager') {
        var query = "select status,count(status) from task_assign where manager_id='" + body['user_id'] + "' group by status ;"
        console.log(query);
        dbconnect.query(query, (err, rows, fields) => {
            console.log(err);
            if (!err) {
                console.log("rows.." + rows['rows']);
                statusData = rows['rows'];
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: statusData
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
    }

})

router.get('/getComPenTask', (req, res, next) => {
    console.log('-------------------->');
    console.log('getComPenTask');
    body = req.body;
    console.log(body);

    if (body['manager_id'].length == 0) {

        dbconnect.query("select * from task_assign where user_id='" + body['user_id'] + "' ", (err, rows, fields) => {
            console.log('Error :: ' + err)
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

    }

    else {
        dbconnect.query("select * from task_assign where manager_id='" + body['manager_id'] + "' ", (err, rows, fields) => {
            console.log('Error :: ' + err)
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

    }

})

router.post('/taskReport', (req, res, next) => {
    console.log('-------------------->');
    console.log('taskReport');
    body = req.body;
    console.log(body);
    dbconnect.query("select * from report_task_assign_v where user_id='" + body['user_id'] + "' and DATE(created) between '" + body['from_date'] + "' and '" + body['to_date'] + "' ", (err, rows, fields) => {

        console.log('Error :: ' + err);
        if (!err) {

            if (rows['rows'].length == 0) {
                res.status(200).json({
                    success: true,
                    message: 'No data found'



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

router.post('/getPendingTaskDetails', (req, res, next) => {
    body = req.body;
    console.log("getPendingTaskDetails",body);

    if (!body['user_id'] || body['user_id'] == null) {
        console.log('user_id  Out cannot be blank')
        res.status(206).json({
            success: false,
            message: 'user_id Out cannot be blank'
        });
        return null;
    }
    if (!body['role'] || body['role'] == null) {
        console.log('role  Out cannot be blank')
        res.status(206).json({
            success: false,
            message: 'role Out cannot be blank'
        });
        return null;
    }
    if (body['role'] == 'Employee') {
        var query = "select * from report_list_data_v where user_id='" + body['user_id'] + "';";
        console.log(query);
        dbconnect.query(query, (err, rows, fields) => {
            console.log("error :: " + err);
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

    if (body['role'] == 'Manager') {
        var query = "select * from report_list_data_v where manager_id='" + body['user_id'] + "';";
        console.log(query);
        dbconnect.query(query, (err, rows, fields) => {
            console.log("error :: " + err);
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

})


router.get('/getTaskType', (req, res, next) => {
    console.log('-------------------->');
    console.log('getTaskType');

    dbconnect.query("select * from task_type where isactive='Y' order by prefrence_no ", (err, rows, fields) => {
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

})


router.post('/submitScanData', (req, res, next) => {
    console.log('-------------------->');
    console.log('submitScanData');
    body = req.body;
    console.log(body);

    dbconnect.query("insert into product_master(sku_code,product_name,product_quantity,product_location) values('" + body['code'] + "','" + body['name'] + "','" + body['quantity'] + "','" + body['address'] + "')", (err, rows, fields) => {
        console.log('error :: ' + err)

        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success'

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
})


router.post('/getUserProductivityDetails', (req, res) => {
    body = req.body;
    var from_date = dateFormat(new Date(body['from_date']), 'mm/dd/yyyy').toString();
    var to_date = dateFormat(new Date((body['to_date'])), 'mm/dd/yyyy').toString();
    console.log("from date :: ",from_date,"ToDAte :: ",to_date)
    var query="SELECT task_assign.user_id,round(sum(task_assign.time_required) / round((date_part('epoch'::text, sum(\"substring\"(task_assign.end_time::text, 1, 19)::timestamp without time zone - \"substring\"(task_assign.start_time::text, 1, 19)::timestamp without time zone)) / 3600::double precision)::numeric, 2) * 100::numeric, 2) AS productivity,  sum(\"substring\"(task_assign.end_time::text, 1, 19)::timestamp without time zone - \"substring\"(task_assign.start_time::text, 1, 19)::timestamp without time zone) AS actual_,    sum(task_assign.time_required) AS sum,ud.firstname,ud.lastname,task_assign.manager_id   FROM task_assign LEFT JOIN user_details ud ON ud.user_id::text = task_assign.user_id::text  WHERE task_assign.status::text = \'Completed\'::text AND task_assign.user_id::text <> \'\'::text AND DATE(task_assign.updated)  between '" + from_date + "' and '" +to_date + "' GROUP BY task_assign.user_id, ud.firstname, ud.lastname, task_assign.manager_id";    //var query = "select * from user_productivity_report_v where DATE(updated) between '" + from_date + "' and '" +to_date + "'";
    console.log(query);
    dbconnect.query(query, (err, rows, fields) => {
        console.log("error :: " + err);
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

router.get('/getStaffID', (req, res, next) => {
    logger.info("Inside getStaffID service");
    var query="select * from employee_master;";
    logger.info(query);
    dbconnect.query(query, (err, rows, fields) => {
        if (!err) {
                res.status(200).json({
                success: true,
                message: 'success',
                data: rows['rows']

            });
           
            return true;

        }
        else {
            logger.error(err);
            res.status(206).json({
                success: false,
                message: 'failed'

            });
            return false;

        }
    });

});

router.get('/getJob', (req, res, next) => {
    logger.info("Inside getJob service");
    var query="select * from validation_master;";
    logger.info(query);
    dbconnect.query(query, (err, rows, fields) => {
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
                data: rows['rows']

            });
           
            return true;

        }
        else {
            logger.error(err);
            res.status(206).json({
                success: false,
                message: 'failed'

            });
            return false;

        }
    });

});

router.post('/getETA', (req, res, next) => {
    logger.info("Inside getETA service");
    body = req.body;
    logger.info(body);
    var query="select * from assign_task_base where task_id ='" + body['task_id'] + "';";
    logger.info(query);
    dbconnect.query(query, (err, rows, fields) => {
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
                data: rows['rows']

            });
           
            return true;

        }
        else {
            logger.error(err);
            res.status(206).json({
                success: false,
                message: 'failed'

            });
            return false;

        }
    });

});
router.post('/startACtivity', (req, res, next) => {
    logger.info("Inside startACtivity Service");
    logger.info(req.body);
    body = req.body
    var activity_date = dateFormat(new Date(body['activity_date']), 'mm/dd/yyyy');
    var query = "INSERT INTO assign_task_base(assign_task_base_id, activity_date, task_id,ref_no,eta, created_date_start_time,validation_master_id, employee_master_id,status,updated_date,actual_qnty,target_qnty,openjob) VALUES (get_uuid(), '" + body['activity_date'] + "','" + body['task_id'] + "','" + body['ref_no'] + "' ,'" + body['eta'] + "', now(), (select validation_master_id from  validation_master where job_code ='" + body['job_code'] + "'),(select employee_master_id from  employee_master where token ='" + body['token'] + "'),'Open',now(),'"+body['actual_qnty']+"','"+body['target_qnty']+"','"+body['openjob']+"')";
    logger.info(query);
    dbconnect.query(query, (err, rows, fields) => {
        //console.log("error :: " + err['code']);
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
            });
               return true;
        }
        else if (err == 'error: duplicate key value violates unique constraint "task_id"') {
            logger.error("error :: " + err);
            res.status(206).json({
                success: false,
                message: 'Task Id already register',
                errorCode: err['code']
            })
            return false;
        }else {
            logger.error("error :: " + err);
            res.json({
                success: false,
                message: 'error while inserting data',
                errorCode: err['code']
            })
            return false;
        };
    });
})


router.post('/EndActivity', (req, res, next) => {
    logger.info("Inside EndActivity Service");
    logger.info(req.body);   
    body = req.body
    if (!body['task_id']|| body['task_id']== null) {
        console.log('task id cannot be blank')
        res.status(206).json({
            success: false,
            message: 'task id cannot be blank'
        });
        return null;
    }
        var query = "UPDATE assign_task_base SET  target_qnty='" + body['target_qnty'] + "', actual_qnty='" + body['actual_qnty'] + "',openjob='" + body['openJob'] + "', end_time=now(),  updated_date=now(),status='Closed' WHERE task_id='" + body['task_id'] + "';";
        logger.info(query);   
        dbconnect.query(query, (err, rows, fields) => {
         if (!err) {
             res.status(200).json({
                 success: true,
                 message: 'success'
             });
         } else {
            logger.error("error :: " + err);
             res.json({
                 success: false,
                 message: 'error while Updating data',
                 errorCode: err['code']
             });
         }
    
     });

    });

    router.post('/getAllDataBYTaskID', (req, res, next) => {
        logger.info("Inside EndActivity Service");
        body = req.body;
        logger.info(body);
        dbconnect.query("SELECT at.assign_task_base_id, at.activity_date::text AS activityDate, at.task_id, at.ref_no, at.target_qnty,at.eta, at.created_date_start_time, at.end_time,at.actual_qnty,at.status,em.employee_master_id,em.token,em.employee_name,vm.job_code,vm.process,vm.uom,vm.remark,vm.validation_master_id FROM assign_task_base at LEFT JOIN employee_master em ON at.employee_master_id = em.employee_master_id LEFT JOIN validation_master vm ON at.validation_master_id = vm.validation_master_id where task_id ='" + body['task_id'] + "';", (err, rows, fields) => {
            if (!err) {
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: rows['rows']
    
                });
               
                return true;
    
            }
            else {
                logger.error(err);
                res.status(206).json({
                    success: false,
                    message: 'failed'
    
                });
                return false;
    
            }
        });
    
    });

    router.get('/getAllActivityList', (req, res, next) => {
        logger.info("Inside getAllActivityList Service");
        var query="SELECT at.assign_task_base_id, at.activity_date::text AS activityDate, at.task_id, at.ref_no, at.target_qnty,at.eta, at.created_date_start_time, at.end_time,at.actual_qnty,at.status,at.updated_date,em.employee_master_id,em.token,em.employee_name,vm.job_code,vm.process,vm.uom,vm.validation_master_id FROM assign_task_base at LEFT JOIN employee_master em ON at.employee_master_id = em.employee_master_id LEFT JOIN validation_master vm ON at.validation_master_id = vm.validation_master_id order by at.updated_date DESC;";
        logger.info(query);
        dbconnect.query(query, (err, rows, fields) => {
            if (!err) {
                res.status(200).json({
                    success: true,
                    message: 'success',
                    data: rows['rows']
    
                });
               
                return true;
    
            }
            else {
                logger.error(err);
                res.status(206).json({
                    success: false,
                    message: 'failed'
    
                });
                return false;
    
            }
        });
    
    });

    router.post('/UpdateTaskStatus', (req, res, next) => {
        logger.info("Inside UpdateTaskStatus Service");
        body = req.body
        logger.info(body);
        if (!body['task_id']|| body['task_id']== null) {
            console.log('task id cannot be blank')
            res.status(206).json({
                success: false,
                message: 'task id cannot be blank'
            });
            return null;
        }
    
            var query = "UPDATE assign_task_base SET  status='" + body['status'] + "',  updated_date=now() WHERE task_id='" + body['task_id'] + "';";
            logger.info(query);
            dbconnect.query(query, (err, rows, fields) => {
             if (!err) {
                 res.status(200).json({
                     success: true,
                     message: 'success'
                 });
             } else {
                logger.error(err);
                 res.json({
                     success: false,
                     message: 'error while Updating data',
                     errorCode: err['code']
                 });
             }
        
         });
    
        });


        router.post('/uploadEmployeeDB', (req, res, next) => {
            logger.info("Inside uploadEmployeeDB Service");
            body = req.body;
            logger.info(body);
            var query="SELECT import_employeemaster('" + body['token'] + "','" + body['employeeName'] + "','" + body['employeeShortName'] + "','" + body['baName'] + "','" + body['department'] + "','" + body['designation'] + "','" + body['gender'] + "');";
            logger.info(query);
            dbconnect.query(query,(err, rows, fields) => {
                if (!err) {
                    res.status(200).json({
                        success: true,
                        message: 'success',
                    });
                       return true;
                }
                else if (err == 'error: duplicate key value violates unique constraint "token"') {
                    logger.error(err);
                    res.status(206).json({
                        success: false,
                        message: 'token already exist in database',
                        errorCode: err['code']
                    })
                    return false;
                }else {
                    logger.error(err);
                    res.json({
                        success: false,
                        message: 'error while inserting data',
                        errorCode: err['code']
                    })
                    return false;
                };
            });
        });

        router.post('/uploadValidationDB', (req, res, next) => {
            logger.info("Inside uploadEmployeeDB Service");
            body = req.body;
            logger.info(body);
            var query="SELECT import_validationmaster('" + body['JobCode'] + "','" + body['Process'] + "','" + body['Department'] + "','" + body['Direct_Indirect'] + "','" + body['Activity_type'] + "','" + body['SPR'] + "','" + body['UOM'] + "','" + body['Remarks'] + "');";
           logger.info(query);
            dbconnect.query(query,(err, rows, fields) => {
                if (!err) {
                    res.status(200).json({
                        success: true,
                        message: 'success',
                    });
                       return true;
                }
                else if (err == 'error: duplicate key value violates unique constraint "JobCode"') {
                    logger.error(err);
                    res.status(206).json({
                        success: false,
                        message: 'JobCode already exist in database',
                        errorCode: err['code']
                    })
                    return false;
                }else {
                    logger.error(err);
                    res.json({
                        success: false,
                        message: 'error while inserting data',
                        errorCode: err['code']
                    })
                    return false;
                };
            });
        });
     
module.exports = router;