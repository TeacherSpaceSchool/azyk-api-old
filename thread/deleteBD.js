const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const cron = require('node-cron');
const MerchandisingAzyk = require('../models/merchandisingAzyk');
connectDB.connect();

if(!isMainThread) {
    cron.schedule('1 3 * * *', async() => {
        let date = new Date()
        date.setDate(date.getDate() - 60)
        console.log(await MerchandisingAzyk.deleteMany({date: {$lte: date}}))
    });
}