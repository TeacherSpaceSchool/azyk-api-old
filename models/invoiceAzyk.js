const mongoose = require('mongoose');

const InvoiceAzykSchema = mongoose.Schema({
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderAzyk'
    }],
    adss: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdsAzyk'
        }],
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    allPrice: Number,
    consignmentPrice: {
        type: Number,
        default: 0
    },
    returnedPrice: {
        type: Number,
        default: 0
    },
    allTonnage: {
        type: Number,
        default: 0
    },
    allSize: {
        type: Number,
        default: 0
    },
    usedBonus: Number,
    inv: {
        type: Number,
        default: 0
    },
    number: String,
    info: String,
    address: [String],
    paymentMethod: String,
    dateDelivery: Date,
    confirmationForwarder: Boolean,
    confirmationClient: Boolean,
    paymentConsignation: Boolean,
    cancelClient: {
        type: Date,
        default: null
    },
    cancelForwarder: {
        type: Date,
        default: null
    },
    sync: {
        type: Number,
        default: 0
    },
    track: {
        type: Number,
        default: 1
    },
    forwarder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    taken: {
        type: Boolean,
        default: false
    },
    del: String,
    district: String,
    editor: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    distributer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk',
        default: null
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk',
        default: null
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk',
        default: null
    },
}, {
    timestamps: true
});


const InvoiceAzyk = mongoose.model('InvoiceAzyk', InvoiceAzykSchema);

module.exports = InvoiceAzyk;