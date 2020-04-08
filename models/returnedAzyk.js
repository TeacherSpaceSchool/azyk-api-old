const mongoose = require('mongoose');

const ReturnedAzykSchema = mongoose.Schema({
    items: mongoose.Schema.Types.Mixed,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    allPrice: Number,
    allTonnage: {
        type: Number,
        default: 0
    },
    allSize: {
        type: Number,
        default: 0
    },
    number: String,
    info: String,
    address: [String],
    confirmationForwarder: {
        type: Boolean,
        default: false
    },
    cancelForwarder: {
        type: Boolean,
        default: false
    },
    sync: {
        type: Number,
        default: 0
    },
    del: String,
    editor: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    distributer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk',
        default: null
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
}, {
    timestamps: true
});


const ReturnedAzyk = mongoose.model('ReturnedAzyk', ReturnedAzykSchema);

module.exports = ReturnedAzyk;