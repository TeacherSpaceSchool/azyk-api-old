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
    priority: {
        type: Number,
        default: 0
    },
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
    city: {
        type: String,
        default: 'Бишкек'
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
    distributed: {
        type: Boolean,
        default: false
    },
    del: String,
    district: String,
    discount: Number,
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


InvoiceAzykSchema.index({createdAt: 1})
InvoiceAzykSchema.index({adss: 1})
InvoiceAzykSchema.index({client: 1})
InvoiceAzykSchema.index({taken: 1})
InvoiceAzykSchema.index({number: 1})
InvoiceAzykSchema.index({info: 1})
InvoiceAzykSchema.index({address: 1})
InvoiceAzykSchema.index({paymentMethod: 1})
InvoiceAzykSchema.index({dateDelivery: 1})
InvoiceAzykSchema.index({del: 1})
InvoiceAzykSchema.index({agent: 1})
InvoiceAzykSchema.index({organization: 1})
InvoiceAzykSchema.index({distributer: 1})
InvoiceAzykSchema.index({provider: 1})
InvoiceAzykSchema.index({sale: 1});

const InvoiceAzyk = mongoose.model('InvoiceAzyk', InvoiceAzykSchema);

module.exports = InvoiceAzyk;