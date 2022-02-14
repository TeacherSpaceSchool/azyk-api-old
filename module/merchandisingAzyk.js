const MerchandisingAzyk = require('../models/merchandisingAzyk');

module.exports.reductionMerchandising = async() => {
    let date = new Date('Sat Feb 01 2022 03:00:00 GMT+0600')
    console.log(await MerchandisingAzyk.count())
    console.log(await MerchandisingAzyk.deleteMany({date: {$lte: date}}))
    console.log(await MerchandisingAzyk.count())
}