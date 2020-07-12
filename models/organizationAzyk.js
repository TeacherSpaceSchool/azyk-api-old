const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const OrganizationAzykSchema = mongoose.Schema({
    name:  {
        type: String,
        required: true,
        unique: true
    },
    image: String,
    address: [String],
    email: [String],
    phone: [String],
    info: String,
    miniInfo: String,
    reiting: Number,
    status: String,
    warehouse:  {
        type: String,
        default: ''
    },
    minimumOrder: Number,
    priotiry: {
        type: Number,
        default: 0
    },
    del: String,
    consignation: {
        type: Boolean,
        default: false
    },
    accessToClient: {
        type: Boolean,
        default: false
    },
    onlyDistrict: {
        type: Boolean,
        default: false
    },
    unite: {
        type: Boolean,
        default: true
    },
    superagent: {
        type: Boolean,
        default: true
    },
    onlyIntegrate: {
        type: Boolean,
        default: false
    },
    autoAccept: {
        type: Boolean,
        default: false
    },
    pass: {
        type: String,
        default: '',
        unique: true
    },
}, {
    timestamps: true
});

OrganizationAzykSchema.plugin(uniqueValidator);

const OrganizationAzyk = mongoose.model('OrganizationAzyk', OrganizationAzykSchema);


module.exports = OrganizationAzyk;