const mongoose = require('mongoose');

const TemplateFormAzykSchema = mongoose.Schema({
    title: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    editorEmployment: Boolean,
    editorClient: Boolean,
    editClient: Boolean,
    questions: [{
        type: String,
        question: String,
        answers: [String]
    }]
}, {
    timestamps: true
});


const TemplateFormAzyk = mongoose.model('TemplateFormAzyk', TemplateFormAzykSchema);

module.exports = TemplateFormAzyk;