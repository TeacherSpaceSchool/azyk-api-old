const InvoiceAzyk = require('../models/invoiceAzyk');

module.exports.reductionInvoices = async() => {
    let invoices = await InvoiceAzyk.find({
        dateDelivery: null
    })
    console.log('reductionInvoices:',invoices.length)
    for (let i = 0; i < invoices.length; i++) {
        invoices[i].dateDelivery = new Date(invoices[i].createdAt)
        invoices[i].dateDelivery.setDate(invoices[i].dateDelivery.getDate() + 1)
        await invoices[i].save()
    }
}