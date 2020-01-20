const mongoose = require('mongoose');

const ItemAzykSchema = mongoose.Schema({
    guid: String,
    stock: Number,
    name: String,
    image: String,
    price: Number,
    packaging:  {
        type: Number,
        default: 1
    },
    reiting: Number,
    deliveryDays: [String],
    apiece: {
        type: Boolean,
        default: false
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategoryAzyk'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    hit: Boolean,
    latest: Boolean,
    del: String,
    status: String,
    info: String,
    favorite: [mongoose.Schema.Types.ObjectId],
    basket: [mongoose.Schema.Types.ObjectId],
    weight: {
        type: Number,
        default: 0
    },
    size: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


const ItemAzyk = mongoose.model('ItemAzyk', ItemAzykSchema);

module.exports = ItemAzyk;