const express = require('express');
const router = express();
var dbconnect = require('../dbconnection');
const bodyparser = require('body-parser');
router.use(bodyparser());
var dateFormat = require('dateformat');
const cors=require('cors');

router.use(cors());

router.get('/getCategory', (req, res, next) => {


    dbconnect.query("select * from asset_category where isactive='Y' ", (err, rows, fields) => {
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


router.post('/submitAsset', (req, res, next) => {
    console.log('----------------------------->')
    console.log('submit Asset')
    console.log(req.body)
    body = req.body
    send = false
    dbconnect.query("select * from insert('" + body['manufacturer'] + "','" + body['model'] + "','" + body['categoryid'] + "')", (err, rows, fields) => {
        console.log('err :' + err)
        if (!err) {
            console.log(rows['rows'])
            asset_id = rows['rows'][0].asset_id
            console.log("------------------------------------------>");
            console.log(asset_id);
            console.log("------------------------------------------>");
            if (body['serial'] == null) {
                res.json({
                    success: false,
                    message: 'serial number cant be empty'

                })
                return false;
            }
            if (asset_id !== null) {

                body['serial'].forEach(element => {

                    console.log('insert into asset count  :' + element)
                    query = "insert into asset_count( asset_id, asset_serial ) values ('" + asset_id + "','" + element + "')"
                    console.log(query)

                    dbconnect.query(query, (err, rows, fields) => {
                        console.log(err)

                        if (!err) { send = true }
                        else { send = false }
                        console.log(send)

                    })


                });
            }
            else {
                res.json({
                    success: false,
                    message: 'manufacturer and model should be unique'

                })
                return false;
                
            }

            setTimeout(() => {

                console.log('send :: ' + send)

                if (send) {
                    res.json({
                        success: true,
                        message: 'success'

                    })
                    return true;


                }
                else {
                    res.json({
                        success: false,
                        message: 'error while fetching insert query data'

                    })
                    return false;

                }
            }, 2000)

        }


        else {
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;
        }

    });

})

router.post('/updateAsset', (req, res, next) => {
    console.log('----------------------------->')
    console.log('update Asset')
    send = false
    console.log(req.body)
    body = req.body
    dbconnect.query("update asset_master set asset_manufacturer='" + body['manufacturer'] + "', asset_model='" + body['model'] + "', category_id='" + body['categoryid'] + "', updated= now()" +
        " where asset_id = '" + body['asset_id'] + "'", (err, rows, fields) => {
            console.log('err :' + err)
            if (!err) {
                if (rows.rowCount == 1) {
                    console.log('updated asset for :: ' + body['asset_id'])
                    body['serial'].forEach(element => {
                        query = "update asset_count set asset_serial='" + element.asset_serial + "' , status = '" + element.status + "', updated=now() where count_id ='" + element.count_id + "' and asset_id = '" + element.asset_id + "' "
                        console.log(query)
                        dbconnect.query(query, (err, rows, fields) => {

                            if (!err) {
                                if (rows.rowCount == 1) {

                                    send = true

                                }
                                else {

                                    send = false
                                }

                            }
                            else {
                                send = false

                            }


                        });
                    })

                    setTimeout(() => {

                        console.log('send :: ' + send)

                        if (send) {
                            res.json({
                                success: true,
                                message: 'success'

                            })
                            return true;


                        }
                        else {
                            res.json({
                                success: false,
                                message: 'error while updating data'

                            })
                            return false;

                        }
                    }, 2000)

                }
                else {
                    console.log('not updated asset for :: ' + body['asset_id'])
                    res.json({
                        success: false,
                        message: 'error while updating data',
                        errorCode: err['code']
                    })
                    return false;

                }

            }

            else {
                res.json({
                    success: false,
                    message: 'error while updating data',
                    errorCode: err['code']
                })
                return false;
            }



        });

})



router.post('/addSerial', (req, res, next) => {
    console.log('--------------------------->')
    console.log('Add Serial for asset')
    console.log(req.body)
    body = req.body
    query = "insert into asset_count(asset_id,asset_serial) values('" + body['asset_id'] + "','" + body['asset_serial'] + "')"
    dbconnect.query(query, (err, rows, fields) => {
        console.log(query)

        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success'

            });
            return true;

        }

        else {

            res.json({
                success: false,
                message: 'failed',
                errorCode: err['code']
            })
            return false;
        }

    });

})








router.post('/getAllAsset', (req, res, next) => {
    console.log('--------------------------->')
    console.log('getAllAsset for category')
    console.log(req.body)
    body = req.body
    query = "select * from asset_master am  join asset_count ac on am.asset_id = ac.asset_id where am.category_id='" + body['categoryid'] + "'"
    dbconnect.query(query, (err, rows, fields) => {
        console.log(err)
        if (!err) {
            console.log(rows.rowCount)
            if (0 == rows.rowCount) {
                res.status(200).json({
                    success: true,
                    message: 'data not found'

                });
                return true;

            }
            else {

                setTimeout(() => {
                    res.status(200).json({
                        success: true,
                        message: 'success',
                        data: rows['rows']
                    });
                    return true;
                }, 2000)
            }

        }
        else {
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;

        }

    })

})


router.post('/assignAsset', (req, res, next) => {
    body = req.body
    console.log('--------------------------->')
    console.log('assignAsset :: ' + body['count_id'] + ' to :: ' + body['user_id'])
    query = " select * from insert_asset_assign('" + body['user_id'] + "','" + body['count_id'] + "')"
    dbconnect.query(query, (err, rows, fields) => {
        console.log(err)
        if (!err) {
            res.status(200).json({
                success: true,
                message: 'success',
                data: rows['rows']
            });
            return true;


        }
        else {
            res.json({
                success: false,
                message: 'error while inserting data',
                errorCode: err['code']
            })
            return false;
        }

    })


})


router.post('/getAllAvailableAsset', (req, res, next) => {
    console.log('--------------------------->')
    console.log('getAllAvailableAsset for category')
    console.log(req.body)
    body = req.body
    query = "select * from asset_master am  join asset_count ac on am.asset_id = ac.asset_id where  ac.status='available' and am.category_id='" + body['categoryid'] + "'"
    dbconnect.query(query, (err, rows, fields) => {
        console.log(err)
        if (!err) {
            console.log(rows.rowCount)
            if (0 == rows.rowCount) {
                res.status(200).json({
                    success: true,
                    message: 'data not found'

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
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;

        }

    })

})



router.post('/getAssignedAssetToUser', (req, res, next) => {
    console.log('--------------------------->')
    console.log('getAssignedAssetToUser ')
    console.log(req.body)
    body = req.body
    query = "select *  from get_assigned_asset_to_user_v where status='assigned' and user_id='" + body['user_id'] + "'"
    dbconnect.query(query, (err, rows, fields) => {
        console.log(err)
        if (!err) {
            console.log(rows.rowCount)
            if (0 == rows.rowCount) {
                res.status(200).json({
                    success: true,
                    message: 'data not found'

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
            res.json({
                success: false,
                message: 'error while fetching data',
                errorCode: err['code']
            })
            return false;

        }

    })

})





router.post('/updateAssignedAssetToUser', (req, res, next) => {
    console.log('--------------------------->')
    console.log('updateAssignedAssetToUser ')
    console.log(req.body)
    body = req.body
    query = "select update_asset_assign('" + body['assign_id'] + "','" + body['count_id'] + "','" + body['is_active'] + "','" + body['status'] + "')"
    dbconnect.query(query, (err, rows, fields) => {
        console.log(err)
        if (!err) {


            res.status(200).json({
                success: true,
                message: 'success'

            });
            return true;


        }
        else {
            res.json({
                success: false,
                message: 'error while updating data',
                errorCode: err['code']
            })
            return false;

        }

    })

})


module.exports = router;