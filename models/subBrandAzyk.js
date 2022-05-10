const mongoose = require('mongoose');
const SubBrandAzykSchema = mongoose.Schema({
    image: String,
    miniInfo: String,
    status: String,
    name: String,
    priotiry: {
        type: Number,
        default: 0
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    del: String,
    cities: [String]
}, {
    timestamps: true
});

const SubBrandAzyk = mongoose.model('SubBrandAzyk', SubBrandAzykSchema);


module.exports = SubBrandAzyk;