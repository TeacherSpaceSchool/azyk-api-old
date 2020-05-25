const mongoose = require('mongoose');
const random = require('mongoose-random');

const AdsAzykSchema = mongoose.Schema({
    image: String,
    url: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    del: String,
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemAzyk'
    },
    count: {
        type: Number,
        default: 0
    },
    title: String,
    targetItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemAzyk'
    },
    targetCount: {
        type: Number,
        default: 0
    },
    targetPrice: {
        type: Number,
        default: 0
    },
    multiplier: {
        type: Boolean,
        default: false
    },
    targetType: {
        type: String,
        default: 'Цена'
    },
}, {
    timestamps: true
});

AdsAzykSchema.plugin(random, { path: 'r' });

const AdsAzyk = mongoose.model('AdsAzyk', AdsAzykSchema);

module.exports = AdsAzyk;