const express = require('express');
const router = express.Router();
const { sendWebPush } = require('../module/webPush');
const UserAzyk = require('../models/userAzyk');
const SubscriberAzyk = require('../models/subscriberAzyk');

router.get('/admin', async (req, res) => {
    let user = await UserAzyk.findOne({role: 'admin'})
    if(user){
        console.log(await UserAzyk.find({role: 'admin'}))
        sendWebPush('AZYK.STORE', 'Не забудьте сделать свой заказ', user._id)
        res.json('Push triggered');
    }
    else {
        res.json('Push error');
    }
});

router.get('/all', (req, res) => {
        sendWebPush('AZYK.STORE', 'Не забудьте сделать свой заказ', 'all')
        res.json('Push triggered');
});
module.exports = router;