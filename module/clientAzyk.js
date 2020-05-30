const ClientAzyk = require('../models/clientAzyk');
const SubscriberAzyk = require('../models/subscriberAzyk');

module.exports.reductionToClient = async() => {
    let clients = await ClientAzyk.find({category: null})
    console.log(`reductionToClient: ${clients.length}`)
    for(let i = 0; i<clients.length;i++){
        clients[i].category = 'B'
        await clients[i].save();
    }
}