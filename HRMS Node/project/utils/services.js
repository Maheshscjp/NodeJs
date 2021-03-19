var bycrpt = require('bcrypt');
const express = require('express');
const router = express();
var dbconnect = require('../dbconnection');
const bodyparser = require('body-parser');
router.use(bodyparser());


module.exports = {
generateHash : function(password){
    return bycrpt.hashSync(password, bycrpt.genSaltSync(9))
},
validPassword : function(password, pass){
    return bycrpt.compareSync(password, pass);
},

}