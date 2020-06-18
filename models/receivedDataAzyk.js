const mongoose = require('mongoose');

const ReceivedDataAzykSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    guid: String,
    name: String,
    addres: String,
    agent: String,
    phone: String,
    type: String,
    status: String,
}, {
    timestamps: true
});

const ReceivedDataAzyk = mongoose.model('ReceivedDataAzyk', ReceivedDataAzykSchema);

module.exports = ReceivedDataAzyk;