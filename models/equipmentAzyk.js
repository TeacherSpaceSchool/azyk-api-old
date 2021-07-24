const mongoose = require('mongoose');

const EquipmentAzykSchema = mongoose.Schema({
    number: String,
    name: String,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
}, {
    timestamps: true
});


const EquipmentAzyk = mongoose.model('EquipmentAzyk', EquipmentAzykSchema);

module.exports = EquipmentAzyk;