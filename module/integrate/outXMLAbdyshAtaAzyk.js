const OutXMLAbdyshAtaAzyk = require('../../models/integrate/outXMLAbdyshAtaAzyk');
const Integrate1CAzyk = require('../../models/integrate1CAzyk');
const InvoiceAzyk = require('../../models/invoiceAzyk');
const DistrictAzyk = require('../../models/districtAzyk');
const uuidv1 = require('uuid/v1.js');
const paymentMethod = {'Наличные': 0, 'Перечисление': 1, 'Консигнация': 5}

module.exports.setOutXMLAbdyshAtaAzyk = async(invoice) => {
    let count
    let price
    let outXMLAbdyshAtaAzyk = await OutXMLAbdyshAtaAzyk
        .findOne({invoice: invoice._id})
    if(outXMLAbdyshAtaAzyk){
        outXMLAbdyshAtaAzyk.status = 'update'
        outXMLAbdyshAtaAzyk.data = []
        for (let i = 0; i < invoice.orders.length; i++) {
            let guidItem = await Integrate1CAzyk
                .findOne({item: invoice.orders[i].item._id})
            if(guidItem) {
                count = invoice.orders[i].count-invoice.orders[i].returned
                price = Math.round(invoice.orders[i].allPrice/invoice.orders[i].count)
                outXMLAbdyshAtaAzyk.data.push({
                    guid: guidItem.guid,
                    package: Math.round(count / (invoice.orders[i].item.packaging ? invoice.orders[i].item.packaging : 1)),
                    qt: count,
                    price: price,
                    amount: count * price,
                    priotiry: invoice.orders[i].item.priotiry
                })
            }
        }
        await outXMLAbdyshAtaAzyk.save()
        await InvoiceAzyk.updateMany({_id: invoice._id}, {sync: 1})
        return 1
    }
    else {
        let guidClient = await Integrate1CAzyk
            .findOne({client: invoice.client._id, organization: invoice.organization._id})
        if(guidClient){
            let district = await DistrictAzyk
                .findOne({client: invoice.client._id, organization: invoice.organization._id})
            let guidAgent = ''
            let guidEcspeditor = ''
            if(district) {
                guidAgent = await Integrate1CAzyk
                    .findOne({agent: district.agent})
                if(guidAgent)
                    guidAgent = guidAgent.guid
                else
                    guidAgent = ''
                guidEcspeditor = await Integrate1CAzyk
                    .findOne({ecspeditor: district.ecspeditor})
                if(guidEcspeditor)
                    guidEcspeditor = guidEcspeditor.guid
                else
                    guidEcspeditor = ''
            }
            let date = new Date(invoice.dateDelivery)
            let newOutXMLAbdyshAtaAzyk = new OutXMLAbdyshAtaAzyk({
                payment: paymentMethod[invoice.paymentMethod],
                data: [],
                guid: await uuidv1(),
                date: date,
                number: invoice.number,
                client: guidClient.guid,
                agent: guidAgent,
                forwarder: guidEcspeditor,
                invoice: invoice._id,
                status: 'create',
                inv: invoice.inv,
            });
            for (let i = 0; i < invoice.orders.length; i++) {
                let guidItem = await Integrate1CAzyk
                    .findOne({item: invoice.orders[i].item._id})
                if (guidItem) {
                    count = invoice.orders[i].count-invoice.orders[i].returned
                    price = Math.round(invoice.orders[i].allPrice/invoice.orders[i].count)
                    newOutXMLAbdyshAtaAzyk.data.push({
                        guid: guidItem.guid,
                        package: Math.round(count / (invoice.orders[i].item.packaging ? invoice.orders[i].item.packaging : 1)),
                        qt: count,
                        price: price,
                        amount: count * price,
                        priotiry: invoice.orders[i].item.priotiry
                    })
                }
            }
            await OutXMLAbdyshAtaAzyk.create(newOutXMLAbdyshAtaAzyk);
            await InvoiceAzyk.updateMany({_id: invoice._id}, {sync: 1})
            return 1
        }
    }
    return 0
}

module.exports.setOutXMLAbdyshAtaAzykLogic = async(invoices, forwarder, track) => {
    if(track!=undefined||forwarder) {
        let guidEcspeditor
        if(forwarder){
            guidEcspeditor = await Integrate1CAzyk
                .findOne({ecspeditor: forwarder})
        }
        await OutXMLAbdyshAtaAzyk.updateMany(
            {invoice: {$in: invoices}},
            {
                status: 'update',
                ...(track!=undefined?{track: track}:{}),
                ...(guidEcspeditor?{forwarder: guidEcspeditor.guid}:{})
            })
        await InvoiceAzyk.updateMany({_id: {$in: invoices}}, {
            sync: 1,
            ...(track!=undefined?{track: track}:{}),
            ...(guidEcspeditor?{forwarder: forwarder}:{})
        })
    }
}

module.exports.cancelOutXMLAbdyshAtaAzyk = async(invoice) => {
    let outXMLAbdyshAtaAzyk = await OutXMLAbdyshAtaAzyk
        .findOne({invoice: invoice._id})
    if(outXMLAbdyshAtaAzyk){
        outXMLAbdyshAtaAzyk.status = 'del'
        await outXMLAbdyshAtaAzyk.save()
        return 1
    }
    return 0
}

module.exports.checkOutXMLAbdyshAtaAzyk = async(guid, exc) => {
    let outXMLAbdyshAtaAzyk = await OutXMLAbdyshAtaAzyk
        .findOne({guid: guid})
    if(outXMLAbdyshAtaAzyk){
        outXMLAbdyshAtaAzyk.status =  exc?'error':'check'
        outXMLAbdyshAtaAzyk.exc =  exc?exc:null
        await outXMLAbdyshAtaAzyk.save()
        await InvoiceAzyk.updateMany({_id: outXMLAbdyshAtaAzyk.invoice}, !exc?{sync: 2}:{})
    }
}