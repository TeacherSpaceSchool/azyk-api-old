const mongoose = require('mongoose');

const FormAzykSchema = mongoose.Schema({
    templateForm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateFormAzyk'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    editor: [[String]],
    questions: [{
        type: String,
        question: String,
        answers: [String]
    }]
}, {
    timestamps: true
});


const FormAzyk = mongoose.model('FormAzyk', FormAzykSchema);

module.exports = FormAzyk;