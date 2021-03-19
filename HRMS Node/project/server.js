const express=require('express');
var app=express();

const userDetails=require('./routes/route.js');
const leaveDetails=require('./routes/leaveroute.js');
const paySlipDetails=require('./routes/paySlip.js');
const forgetPasswordDetails = require('./routes/forgetPassword.js');
const timesheetDetails=require('./routes/timesheetroute.js');
const assetDetails = require('./routes/asset.js');
const taskDetails = require('./routes/task.js');
const traklogDetails = require('./routes/traklog.js');
const cors=require('cors');



function startServer(){
    
    app.listen(3000,()=>console.log('express server is running on 3000'));
    app.use(cors());

    app.use('/userDetails',userDetails);
    app.use('/leaveDetails',leaveDetails);
    app.use('/paySlipDetails',paySlipDetails);
    app.use('/forgetPassword',forgetPasswordDetails);
    app.use('/timesheetDetails',timesheetDetails);
    app.use('/assetDetails',assetDetails);
    app.use('/taskDetails',taskDetails);
    app.use('/traklogDetails',traklogDetails);
}

exports.startServer=startServer;