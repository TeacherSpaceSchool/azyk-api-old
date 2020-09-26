const { reductionCategoryAzyk } = require('../module/categoryAzyk');
const { reductionSubCategoryAzyk } = require('../module/subCategoryAzyk');
const { reductionToBonus } = require('../module/bonusAzyk');
const { reductionToRoute } = require('../module/routeAzyk');
const { reductionToAgentRoute } = require('../module/agentRouteAzyk');
const { reductionSingleOutXMLAzyk } = require('../module/reductionSingleOutXMLAzyk');
const { reductionOutAdsXMLAzyk } = require('../module/singleOutXMLAzyk');
const { reductionToOrganization } = require('../module/organizationAzyk');
const { reductionToClient } = require('../module/clientAzyk');
const { reductionToItem } = require('../module/itemAzyk');
const { reductionInvoices } = require('../module/invoiceAzyk');
const { startClientRedis } = require('../module/redis');
const { reductionToUser, createAdmin } = require('../module/user');
const { Worker, isMainThread } = require('worker_threads');
const OrganizationAzyk = require('../models/organizationAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const OrderAzyk = require('../models/orderAzyk');
const { setSingleOutXMLAzyk } = require('../module/singleOutXMLAzyk');
const { checkAdss } = require('../graphql/adsAzyk');
const { pubsub } = require('../graphql/index');
const RELOAD_ORDER = 'RELOAD_ORDER';

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
        let w = new Worker('./thread/singleOutXMLAzyk.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('SingleOutXMLAzyk: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`SingleOutXMLAzyk stopped with exit code ${code}`))
        });
        console.log('SingleOutXMLAzyk '+w.threadId+ ' run')
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
    await createAdmin();
    //await reductionSingleOutXMLAzyk()
    //await startClientRedis()
    await startResetUnloading()
    await startReminderClient();
    //await startResetBonusesClient()
    await startOutXMLShoroAzyk();
    //await reductionInvoices()
    //await reductionCategoryAzyk()
    //await reductionSubCategoryAzyk()
    //await reductionToRoute()
    //await reductionToBonus()
    await reductionToClient()
    await reductionToOrganization()
    await reductionToItem()
    //await reductionToUser()
    //await reductionToAgentRoute();
    //await reductionOutAdsXMLShoroAzyk()
}

module.exports.start = start;
