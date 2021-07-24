const { reductionCategoryAzyk } = require('../module/categoryAzyk');
const { reductionSubCategoryAzyk } = require('../module/subCategoryAzyk');
const { reductionSubBrands } = require('../module/subBrandAzyk');
const { reductionToRoute } = require('../module/routeAzyk');
const { reductionToAgentRoute } = require('../module/agentRouteAzyk');
const { reductionSingleOutXMLAzyk } = require('../module/reductionSingleOutXMLAzyk');
const { reductionOutAdsXMLAzyk } = require('../module/singleOutXMLAzyk');
const { reductionToOrganization } = require('../module/organizationAzyk');
const { reductionToClient } = require('../module/clientAzyk');
const { reductionToAds } = require('../module/adsAzyk');
const { reductionToItem } = require('../module/itemAzyk');
const { reductionInvoices } = require('../module/invoiceAzyk');
const { reductionReturneds } = require('../module/returnedAzyk');
const { reductionToDeliveryDate } = require('../module/deliveryDateAzyk');
const { startClientRedis } = require('../module/redis');
const { reductionToUser, createAdmin } = require('../module/user');
const { Worker, isMainThread } = require('worker_threads');
const OrganizationAzyk = require('../models/organizationAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const OrderAzyk = require('../models/orderAzyk');
const { setSingleOutXMLAzyk } = require('../module/singleOutXMLAzyk');
const { checkAdss } = require('../graphql/adsAzyk');
const { pubsub } = require('../graphql/index');

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
            console.log('ReminderClient: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ReminderClient stopped with exit code ${code}`))
        });
        console.log('ReminderClient '+w.threadId+ ' run')
    }
}

let start = async () => {
    await createAdmin();
    //await startClientRedis()
    await startResetUnloading()
    await startReminderClient();
    await startOutXMLShoroAzyk();
    await reductionSubBrands();
    //await reductionToDeliveryDate();
    //await reductionSingleOutXMLAzyk()
    //await reductionInvoices()
    //await reductionReturneds()
    //await reductionCategoryAzyk()
    //await reductionSubCategoryAzyk()
    //await reductionToRoute()
    //await reductionToClient()
    //await reductionToOrganization()
    //await reductionToItem()
    //await reductionToUser()
    //await reductionToAgentRoute();
    //await reductionOutAdsXMLShoroAzyk()
    //await reductionToAds()
}

module.exports.start = start;
