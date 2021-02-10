const mongoose = require('mongoose');

const MerchandisingAzykSchema = mongoose.Schema({
    employment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    date: Date,
    productAvailability: [String],
    productInventory: Boolean,
    productConditions: Number,
    productLocation: Number,
    images: [String],
    fhos: mongoose.Schema.Types.Mixed,
    needFho: Boolean,
    check: Boolean,
    stateProduct: Number,
    comment: String,
    geo: String,
    reviewerScore: {
        type: Number,
        default: 0
    },
    reviewerComment: {
        type: String,
        default: ''
    },
}, {
    timestamps: true
});


const MerchandisingAzyk = mongoose.model('MerchandisingAzyk', MerchandisingAzykSchema);

module.exports = MerchandisingAzyk;