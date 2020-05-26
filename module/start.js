const { startCategoryAzyk } = require('../module/categoryAzyk');
const { startSubCategoryAzyk } = require('../module/subCategoryAzyk');
const { reductionToBonus } = require('../module/bonusAzyk');
const { reductionToRoute } = require('../module/routeAzyk');
const { reductionToAgentRoute } = require('../module/agentRouteAzyk');
const { reductionToClient } = require('../module/clientAzyk');
const { reductionInvoices } = require('../module/invoiceAzyk');
const { startClientRedis } = require('../module/redis');
const { reductionToUser, createAdmin } = require('../module/user');
const { reductionOutAdsXMLShoroAzyk } = require('../module/outXMLShoroAzyk');
const { Worker, isMainThread } = require('worker_threads');

let startResetBonusesClient = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/resetBonusesClient.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ResetBonusesClient: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ResetBonusesClient stopped with exit code ${code}`))
        });
        console.log('ResetBonusesClient '+w.threadId+ ' run')
    }
}

let startResetUnloading = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/resetUnloading.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ResetUnloading: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ResetUnloading stopped with exit code ${code}`))
        });
        console.log('ResetUnloading '+w.threadId+ ' run')
    }
}

let startOutXMLShoroAzyk = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/outXMLShoroAzyk.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('OutXMLShoroAzyk: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`OutXMLShoroAzyk stopped with exit code ${code}`))
        });
        console.log('OutXMLShoroAzyk '+w.threadId+ ' run')
    }
}

let startReminderClient = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/reminderClient.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ReminderBonusesClient: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ReminderBonusesClient stopped with exit code ${code}`))
        });
        console.log('ReminderBonusesClient '+w.threadId+ ' run')
    }
}

let start = async () => {
    //await startClientRedis()
    //await reductionInvoices()
    //await startCategoryAzyk()
    await startResetUnloading()
    //await startSubCategoryAzyk()
    //await reductionToRoute()
    //await reductionToBonus()
    //await reductionToClient()
    //await reductionToUser()
    //await startResetBonusesClient()
    await startReminderClient();
    //await reductionToAgentRoute();
    await createAdmin();
    await startOutXMLShoroAzyk();
    //await reductionOutAdsXMLShoroAzyk()
}

module.exports.start = start;
