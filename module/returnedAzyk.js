const ReturnedAzyk = require('../models/returnedAzyk');

module.exports.reductionReturneds = async() => {
    /*let invoices = await InvoiceAzyk.find({
        city: null
    })
    console.log('reductionInvoices:',invoices.length)*/
    await ReturnedAzyk.updateMany({city: null}, {city: 'Бишкек'});
    /*for (let i = 0; i < invoices.length; i++) {
        invoices[i].city = 'Бишкек'
        await invoices[i].save()
    }*/
}