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
    productAvailability: [String],
    productInventory: Boolean,
    productConditions: Number,
    productLocation: Number,
    productScore: Number,
    image: [String],
    fhos: [{
        type: String,
        image: [String],
        layout: Number,
        state: Number,
        foreignProducts: Boolean,
        filling: Number,
        score: Number
    }],
    needFho: Boolean,
    score: Number,
    comment: String,
}, {
    timestamps: true
});


const MerchandisingAzyk = mongoose.model('MerchandisingAzyk', MerchandisingAzykSchema);

module.exports = MerchandisingAzyk;