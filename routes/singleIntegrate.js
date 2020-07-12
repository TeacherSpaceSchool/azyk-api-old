let express = require('express');
let router = express.Router();
const {getSingleOutXMLClientAzyk, checkSingleOutXMLClientAzyk, getSingleOutXMLAzyk, checkSingleOutXMLAzyk, getSingleOutXMLReturnedAzyk, checkSingleOutXMLReturnedAzyk} = require('../module/singleOutXMLAzyk');
let logger = require('logger').createLogger('integrate1Cshoro.log');
const ModelsErrorAzyk = require('../models/errorAzyk');
const ReceivedDataAzyk = require('../models/receivedDataAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');

router.post('/:pass/put/client', async (req, res, next) => {
    let startDate = new Date()
    let organization = await OrganizationAzyk
        .findOne({pass: req.params.pass})
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            let integrate1CAzyk = await Integrate1CAzyk.findOne({
                organization: organization._id,
                guid: req.body.elements[0].elements[i].attributes.guid
            })
            let _object = new ReceivedDataAzyk({
                status: integrate1CAzyk?'Изменить':'Добавить',
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

router.post('/:pass/put/employment', async (req, res, next) => {
    let organization = await OrganizationAzyk
        .findOne({pass: req.params.pass})
    res.set('Content+Type', 'application/xml');
    try{
        let position = ''
        if(req.body.elements[0].attributes.mode==='agent')
            position = 'агент'
        else if(req.body.elements[0].attributes.mode==='forwarder')
            position = 'экспедитор'
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            let integrate1CAzyk = await Integrate1CAzyk.findOne({
                organization: organization._id,
                guid: req.body.elements[0].elements[i].attributes.guid
            })
            let _object = new ReceivedDataAzyk({
                status: integrate1CAzyk?'Изменить':'Добавить',
                organization: organization._id,
                name: req.body.elements[0].elements[i].attributes.name,
                guid: req.body.elements[0].elements[i].attributes.guid,
                position: position,
                type: 'сотрудник'
            });
            await ReceivedDataAzyk.create(_object)
        }
        await res.status(200);
        await res.end('success')
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

router.get('/:pass/out/client', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXMLClientAzyk(req.params.pass))
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

router.get('/:pass/out/returned', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXMLReturnedAzyk(req.params.pass))
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

router.get('/:pass/out/sales', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await getSingleOutXMLAzyk(req.params.pass))
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

router.post('/:pass/put/returned/confirm', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            await checkSingleOutXMLReturnedAzyk(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
        }
         await res.status(200);
        await res.end('success')
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

router.post('/:pass/put/sales/confirm', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            await checkSingleOutXMLAzyk(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
        }
        await res.status(200);
        await res.end('success')
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

router.post('/:pass/put/client/confirm', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {

            await checkSingleOutXMLClientAzyk(req.params.pass, req.body.elements[0].elements[i].attributes.guid, req.body.elements[0].elements[i].attributes.exc)
        }
        await res.status(200);
        await res.end('success')
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