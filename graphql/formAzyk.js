const TemplateFormAzyk = require('../models/form/templateFormAzyk');
const FormAzyk = require('../models/form/formAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type TemplateForm {
    _id: ID
    createdAt: Date
    title: String
    organization: Organization
    editorEmployment: Boolean
    editorClient: Boolean
    fieldFromClient: [String]
    questions: [QuestionForm]
  }
  type Form {
    _id: ID
    createdAt: Date
    templateForm: TemplateForm
    client: Client
    organization: Organization
    questions: [QuestionsForm]
    editor: [[String]]
  }
  type QuestionForm {
    _id: ID
    type: String
    question: String
    answers: [String]
  }
  input QuestionFormInput {
    _id: ID
    type: String
    question: String
    answers: [String]
  }
`;

const query = `
    templateForms(search: String!, organization: ID!): [TemplateForm]
    forms(templateForms: ID!, search: String!): Form
    form(_id: ID!): Form
`;

const mutation = `
    addTemplateForm(name: String!, organization: ID!, editorEmployment: Boolean, editorClient: Boolean, fieldFromClient: [String], questions: [QuestionFormInput]!): Data
    setTemplateForm(_id: ID!, name: String, organization: ID, editorEmployment: Boolean, editorClient: Boolean, fieldFromClient: [String], questions: [QuestionFormInput]): Data
    addForm(templateForm: ID!, client: ID!, organization: ID!,  questions: [QuestionFormInput]!): Data
    setForm(_id: ID!, questions: [QuestionFormInput]!): Data
    deleteTemplateForm(_id: [ID]!): Data
    deleteForm(_id: [ID]!): Data
`;

const resolvers = {

};

const resolversMutation = {

};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;