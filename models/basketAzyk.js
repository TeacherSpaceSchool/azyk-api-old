const mongoose = require('mongoose');

const BasketAzykSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemAzyk'
    },
    count: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    consignment: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});


const BasketAzyk = mongoose.model('BasketAzyk', BasketAzykSchema);

module.exports = BasketAzyk;