var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport(
    {
        host: 'mail.upvoteconsulting.com',
        port: 465,
        tls: { rejectUnauthorized: false },
        auth: {
            user: 'info@upvoteconsulting.com',
            pass: 'info123'
        }
    }
);


async function sendMailToUser(data){
var result = await transporter.sendMail(data, function (error, info) {
    if (error) {
        console.log("Error While sending Mail ")
        console.log(error)
        return (error);
    } else {
        console.log("mail sent successfully.")
        return ('mail sent successfully.');
    }
});
}


exports.sendMailToUser= sendMailToUser;