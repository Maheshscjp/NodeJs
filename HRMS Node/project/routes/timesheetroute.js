const express = require('express');
const router = express();
var dbconnect = require('../dbconnection');
const bodyparser = require('body-parser');
var dateFormat = require('dateformat');
router.use(bodyparser());

router.get('/getProjectList', (req, res, next) => {

    var query = "SELECT project_master_id, project_code, project_name, description, start_date, end_date FROM project_master;";
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

router.post('/addTimesheetData', (req, res, next) => {
    console.log(req.body);
    var error = false;
    body = req.body

//     var user_id = body['user_id'];
//     var selected_week = body['selectedWeek'];
//     var jsonData = body["rowData"]
//     if(user_id==null || selected_week==null){
//         console.log("Data cannot be blank");
//         res.json({
//             success: false,
//             message: 'Data cannot be blank',
//         })
//     }
//     jsonData.forEach(function (element) {
        
            
//         if (element.timesheetMasterId !=null){
//             var query = "update timesheet_master set mon_hours = '"+ element.mon +"', tue_hours ='"+ element.tue +"\
//             ', wed_hours = '"+ element.wed +"', thu_hours ='" + element.thu + "', fri_hours = '"+ element.fri +"', sat_hours =\
//              '"+ element.sat +"', sun_hours = '"+ element.sun +"', updated_date = now() where timesheet_master_id ='"+ element.timesheetMasterId +"';" 
//         }

//         else{
//             var query= "INSERT INTO timesheet_master(timesheet_master_id, user_id, selected_week,timesheet_sequesnce ,\
//                 project_code, mon_hours, tue_hours, wed_hours, thu_hours, fri_hours, sat_hours, sun_hours, is_aprroved,\
//                 created_date, updated_date) VALUES (get_uuid(), '" + user_id + "','" + selected_week + "', '\
//                 "+ element.srNo + "','" + element.ProjectCode + "', '" + element.mon + "', '" + element.tue + "',\
//                 '" + element.wed + "', '" + element.thu + "', '" + element.fri + "', '" + element.sat + "', '\
//                 " + element.sun + "','N' ,  now() , now());";
//         }
        
//         console.log(query);
//         dbconnect.query(query,(err, rows, fields) => {
//             if (err) {
//                 error = true;    
//                 console.log("error Data :: " + error);            
//             }
//         });

//     });

//     setTimeout(() => { 
//     console.log("error :: " + error);
//     if (!error) {
//         res.status(200).json({
//             success: true,
//             message: 'success',
//         });
//         // return true;
//     }
//     else {
//         console.log(error);
//         res.json({
//             success: false,
//             message: 'error while inserting data',
//         })
//         dbconnect.query("DELETE FROM timesheet_master WHERE user_id='"+ user_id +"' and selected_week='"+ selected_week +"';",(err, rows, fields) => {
//             if(!err){
//                 console.log("");
//             }
//         })
//     };
// }, 2000);
})

router.post('/getTimesheetData', (req, res) => {

    body = req.body
    
    var user_id = body['user_id'];
    var selected_week = body['selectedWeek'];

    var query = "select timesheet_master_id, user_id, selected_week, timesheet_sequesnce ,project_code, mon_hours, tue_hours, wed_hours, thu_hours, fri_hours, sat_hours, sun_hours\
    from timesheet_master  where user_id ='"+ user_id +"' and selected_week='"+ selected_week +"' limit 10;";
    console.log("->->->->->-");
    console.log(query);
    dbconnect.query(query, (err, rows) => {
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




module.exports = router;