const express = require('express');
const router = express();
const bodyparser = require('body-parser');
router.use(bodyparser());
var constants = require('../constants/constants');
const pdf2base64 = require('pdf-to-base64');
const fs = require('fs');
const cors=require('cors');

router.use(cors());

router.post('/getPDF', (req, res, next) => {

    console.log(req.body);
    body = req.body

   year = body['year'];
   month = body['month'];
   email = body['email'];

   var pdfPath = constants.PDFpath+'/'+year+'/'+month+'/'+email+'.pdf';
   console.log('Pay Slip Path :: '+pdfPath);

   fs.exists(pdfPath, (exists) => {
    if(exists){

        pdf2base64(pdfPath)
    .then(
        (response) => {
          
            res.status(200).json({
                success: true,
                message: 'success',
                data: response

            });
            return true;
        }
    )
    .catch(
        (error) => {
            console.log('something went wromg')
            console.log(error); //Exepection error....
            res.status(206).json({
                success: false,
                message: 'failed'
            });
            return false;
        }
    )
    }
    else{
        console.log('File not found ::'+pdfPath);
        res.status(206).json({
            success: false,
            message: 'failed'
        });
        return false;


    }



});
});

module.exports = router;

