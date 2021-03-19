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
const bycrpt = require('bcrypt');
const cors=require('cors');

router.use(cors());


router.post('/verifyUser', (req, res, next) => {
    body = req.body;
    var email_id = body['email'];
    var dob = dateFormat(new Date((body['dob'])), 'mm/dd/yyyy');
    console.log('verifyUser email :: ' + email_id + '    dob ::' + dob)
    dbconnect.query("select * from user_details where email ='" + email_id + "' and  dob='" + dob + "'", (err, rows, fields) => {
        if (!err) {
            var length = rows.rows.length;

            if (length > 0) {
                var OTP = randomize('0', 6);
                console.log('OTP :: ' + OTP)

                var sendTo = rows['rows'][0]['email'];
                console.log('send to :: ' + sendTo);
                var mailOptions = {
                    from: constants.FromMailId,
                    to: sendTo,
                    subject: constants.SubjectForgetPasswordMail,
                    text: 'Dear ' + rows['rows'][0]['firstname'] + constants.MailBodyForgetPasswordMail + OTP
                };

                dbconnect.query("insert into otp_master(id, email, otp, created) values (get_uuid(),'" + sendTo + "','" + OTP + "',now())", (err, result) => {
                    if (!err) {
                        email.sendMailToUser(mailOptions);
                        res.status(200).json({
                            success: true,
                            message: 'success'


                        });
                        return true;
                    }
                    else {

                        console.log('error :: ' + err)
                        res.status(206).json({
                            success: false,
                            message: 'OTP is not generated.'


                        });
                        return false;

                    }


                });




            }
            else {
                res.status(206).json({
                    success: false,
                    message: 'Please Check Email And/OR DOB.',
                    data: rows['rows']

                });
                return false;

            }

        }
        else {
            console.log(err);
            res.status(206).json({
                success: false,
                message: 'failed'

            });
            return false;
        }
    });


});

router.post('/verifyOTP', (req, res, next) => {
    body = req.body;
    var email_id = body['email'];
    var user_otp = body['user_otp'];

    console.log('verifyOTP email :: ' + email_id + ' otp :: ' + user_otp);

    dbconnect.query("select * from otp_master where email='" + email_id + "' order by created desc limit 1", (err, rows, fields) => {


        var exist_otp = rows['rows'][0].otp;
        console.log('exist_otp :: ' + exist_otp);
        if (exist_otp == user_otp) {

            console.log('otp match');
            res.status(200).json({
                success: true,
                message: 'success'


            });
            return true;
        }
        else {
            console.log('otp not match')
            res.status(206).json({
                success: false,
                message: 'failed'

            });
            return false;
        }


    });

});


router.post('/updatePassword', (req, res, next) => {
    body = req.body;
    var email_id = body['email'];
    var password = body['password'];
    console.log('updatePassword for email :: ' + email_id);

    var encryptPass = bycrpt.hashSync(password, bycrpt.genSaltSync(9));
    console.log('encryptPass :: '+encryptPass);

      dbconnect.query("update user_details set password='" + encryptPass + "' where email='" + email_id + "'", (err, rows, fields) => {
        if (!err) {
            
            if (rows.rowCount == 1) {
                console.log('password updated.');
                res.status(200).json({
                    success: true,
                    message: 'success'


                });

                var sendTo = email_id
                console.log('send to :: ' + sendTo);
                var mailOptions = {
                    from: constants.FromMailId,
                    to: sendTo,
                    subject: constants.SubjectForgetPasswordMail,
                    text:  constants.MailBodyForgetPasswordMailSuccess
                };
                email.sendMailToUser(mailOptions);

                return true;

            }
            else {
                console.log('password not updated.');
                res.status(206).json({
                    success: false,
                    message: 'failed'

                });
                return false;

            }
        }
        else {
            console.log('error :: ' + err);
            res.status(206).json({
                success: false,
                message: 'failed'

            });
            return false;
        }

    });


});


module.exports = router;