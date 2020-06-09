let express = require('express');
let router = express.Router();
const {putOutXMLClientShoroAzyk ,getOutXMLClientShoroAzyk, checkOutXMLClientShoroAzyk, getOutXMLShoroAzyk, checkOutXMLShoroAzyk, getOutXMLReturnedShoroAzyk, checkOutXMLReturnedShoroAzyk} = require('../module/outXMLShoroAzyk');
let logger = require('logger').createLogger('integrate1Cshoro.log');
const ModelsErrorAzyk = require('../models/errorAzyk');
const ReceivedDataAzyk = require('../models/receivedDataAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');

router.post('/shoro/put/client', async (req, res, next) => {
    let startDate = new Date()
    let organization = await OrganizationAzyk
        .findOne({name: 'ЗАО «ШОРО»'})
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            let _object = new ReceivedDataAzyk({
                organization: organization._id,
                name: req.body.elements[0].elements[i].attributes.name,
                guid: req.body.elements[0].elements[i].attributes.guid,
                addres: req.body.elements[0].elements[i].attributes.address,
                agent: req.body.elements[0].elements[i].attributes.agent,
                phone: req.body.elements[0].elements[i].attributes.tel,
                type: 'клиент'
            });
            await ReceivedDataAzyk.create(_object)
        }
        await res.status(200);
        await res.end('success')
        logger.info(`put client start: ${startDate}; time: ${(new Date() - startDate) / 1000}; url: ${req.route.path}`);
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: err.path
        });
        await ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/shoro/out/client', async (req, res, next) => {
    let startDate = new Date()
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getOutXMLClientShoroAzyk())
        logger.info(`out client start: ${startDate}; time: ${(new Date() - startDate) / 1000}; url: ${req._parsedOriginalUrl.pathname}`);
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: err.path
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/shoro/out/returned', async (req, res, next) => {
    let startDate = new Date()
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getOutXMLReturnedShoroAzyk())
        logger.info(`out returned start: ${startDate}; time: ${(new Date() - startDate) / 1000}; url: ${req._parsedOriginalUrl.pathname}`);
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: err.path
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/shoro/out/sales', async (req, res, next) => {
    let startDate = new Date()
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getOutXMLShoroAzyk())
        logger.info(`out sales start: ${startDate}; time: ${(new Date() - startDate) / 1000}; url: ${req._parsedOriginalUrl.pathname}`);
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: err.path
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/shoro/put/returned/confirm', async (req, res, next) => {
    let startDate = new Date()
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            await checkOutXMLReturnedShoroAzyk(req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
        }
         await res.status(200);
        await res.end('success')
        logger.info(`put returned start: ${startDate}; time: ${(new Date() - startDate) / 1000}; url: ${req.route.path}`);
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: err.path
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/shoro/put/sales/confirm', async (req, res, next) => {
    let startDate = new Date()
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            await checkOutXMLShoroAzyk(req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
        }
        await res.status(200);
        await res.end('success')
        logger.info(`put sales start: ${startDate}; time: ${(new Date() - startDate) / 1000}; url: ${req.route.path}`);
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: err.path
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/shoro/put/client/confirm', async (req, res, next) => {
    let startDate = new Date()
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            await checkOutXMLClientShoroAzyk(req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
        }
        await res.status(200);
        await res.end('success')
        logger.info(`put client start: ${startDate}; time: ${(new Date() - startDate) / 1000}; url: ${req.route.path}`);
    } catch (err) {
        let _object = new ModelsErrorAzyk({
            err: err.message,
            path: err.path
        });
        ModelsErrorAzyk.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;