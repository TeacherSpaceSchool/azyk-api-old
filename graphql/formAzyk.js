const TemplateFormAzyk = require('../models/form/templateFormAzyk');
const FormAzyk = require('../models/form/formAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const ClientAzyk = require('../models/clientAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type TemplateForm {
    _id: ID
    createdAt: Date
    title: String
    organization: Organization
    editorEmployment: Boolean
    editorClient: Boolean
    edit: Boolean
    questions: [QuestionForm]
  }
  type Form {
    _id: ID
    createdAt: Date
    templateForm: TemplateForm
    client: Client
    agent: Employment
    questions: [QuestionForm]
     organization: Organization
 }
  type AnalysisForm {
    editor: [AnalysisEditorForm]
    questions: [AnalysisQuestionsForm]
  }
  type AnalysisEditorForm {
    _id: ID
    name: String
    count: Int
  }
  type AnalysisQuestionsForm {
    _id: ID
    answers: [AnalysisAnswerForm]
  }
  type AnalysisAnswerForm {
    _id: ID
    count: Int
  }
  type QuestionForm {
    formType: String
    question: String
    answers: [String]
    answer: [String]
  }
  input QuestionFormInput {
    answers: [String]
    formType: String
    question: String
    answer: [String]
    file: Upload
  }
`;

const query = `
    analysisForms(templateForm: ID!): AnalysisForm
    templateForms(search: String!, organization: ID, skip: Int): [TemplateForm]
    templateForm(_id: ID!): TemplateForm
    forms(templateForm: ID!, search: String!, skip: Int): [Form]
    form(_id: ID!): Form
`;

const mutation = `
    addTemplateForm(title: String!, organization: ID!, editorEmployment: Boolean!, editorClient: Boolean!, edit: Boolean!, questions: [QuestionFormInput]!): Data
    setTemplateForm(_id: ID!, title: String, editorEmployment: Boolean, editorClient: Boolean, edit: Boolean, questions: [QuestionFormInput]!): Data
    addForm(templateForm: ID!, client: ID!, questions: [QuestionFormInput]!): Data
    setForm(_id: ID!, questions: [QuestionFormInput]!): Data
    deleteTemplateForm(_id: [ID]!): Data
    deleteForm(_id: [ID]!): Data
`;

const resolvers = {
    templateForms: async(parent, {search, organization, skip}, {user}) => {
        if(user.role==='admin'){
            let templateForms = await TemplateFormAzyk.find({...organization?{organization: organization}:{}, title: {'$regex': search, '$options': 'i'}})
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
            return templateForms
        }
        else if(['суперорганизация', 'организация', 'менеджер'].includes(user.role)){
            let templateForms = await TemplateFormAzyk.find({title: {'$regex': search, '$options': 'i'}, organization: user.organization})
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
            return templateForms
        }
        else if(user.role==='агент'){
            let templateForms = await TemplateFormAzyk.find({title: {'$regex': search, '$options': 'i'}, organization: user.organization, editorEmployment: true})
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
            return templateForms
        }
        else if(user.role==='client'){
            let templateForms = await FormAzyk.find({client: user.client}).distinct('templateForm').lean()
            templateForms = await TemplateFormAzyk.find({
                ...organization?{organization: organization}:{},
                title: {'$regex': search, '$options': 'i'},
                _id: {$nin: templateForms},
                editorClient: true
            })
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
            return templateForms
        }
    },
    analysisForms: async(parent, {templateForm}, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)) {
            let forms = await FormAzyk.find({...user.organization?{organization: user.organization}:{}, templateForm: templateForm})
                .populate({path: 'agent', select: '_id name'})
                .lean()
            let editor = {
                'Всего': {
                    _id: 'Всего',
                    name: 'Всего',
                    count: forms.length
                },
                'Клиенты': {
                    _id: 'Клиенты',
                    name: 'Клиенты',
                    count: 0
                },
            }
            let answers = {}
            for (let i = 0; i < forms.length; i++) {
                if (forms[i].agent) {
                    if (!editor[forms[i].agent._id])
                        editor[forms[i].agent._id] = {
                            _id: forms[i].agent.name,
                            name: forms[i].agent.name,
                            count: 0
                        }
                    editor[forms[i].agent._id].count += 1
                }
                else editor['Клиенты'].count += 1
                for (let i1 = 0; i1 < forms[i].questions.length; i1++) {
                    if(['один из списка', 'несколько из списка'].includes(forms[i].questions[i1].formType)){
                        if(!answers[forms[i].questions[i1].question])
                            answers[forms[i].questions[i1].question] = {
                                _id: forms[i].questions[i1].question,
                                answers: {}
                            }
                        for (let i2 = 0; i2 < forms[i].questions[i1].answer.length; i2++) {
                            if(!answers[forms[i].questions[i1].question].answers[forms[i].questions[i1].answer[i2]])
                                answers[forms[i].questions[i1].question].answers[forms[i].questions[i1].answer[i2]] = {
                                    _id: forms[i].questions[i1].answer[i2],
                                    count: 0
                                }
                            answers[forms[i].questions[i1].question].answers[forms[i].questions[i1].answer[i2]].count+=1
                        }
                    }
                }
            }
            let data = {
                editor: [],
                questions: []
            }
            let keys = Object.keys(editor)
            for(let i=0; i<keys.length; i++){
                data.editor.push({
                    _id: editor[keys[i]]._id,
                    name: editor[keys[i]].name,
                    count: editor[keys[i]].count
                })
            }
            data.editor = data.editor.sort(function (a, b) {
                return a.count - b.count
            });
            keys = Object.keys(answers)
            let question
            for(let i=0; i<keys.length; i++){
                question = {
                    _id: answers[keys[i]]._id,
                    answers: []
                }
                let keys1 = Object.keys(answers[keys[i]].answers)
                for(let i1=0; i1<keys1.length; i1++){
                    question.answers.push({
                        _id: answers[keys[i]].answers[keys1[i1]]._id,
                        count: answers[keys[i]].answers[keys1[i1]].count
                    })
                }
                question.answers = question.answers.sort(function (a, b) {
                    return a.count - b.count
                });
                data.questions.push(question)
            }
            return data
        }
    },
    templateForm: async(parent, {_id}, {user}) => {
        if(user.role==='admin'){
            return await TemplateFormAzyk.findOne({_id: _id})
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .lean()
        }
        else if(['суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)){
            return await TemplateFormAzyk.findOne({_id: _id, organization: user.organization})
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .lean()
        }
        else if(user.role==='агент'){
            return await TemplateFormAzyk.findOne({_id: _id, organization: user.organization, editorEmployment: true})
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .lean()
        }
        else if(user.role==='client'){
            return await TemplateFormAzyk.findOne({_id: _id, editorClient: true})
                .populate({
                    path: 'organization',
                    select: 'name _id'
                })
                .sort('-createdAt')
                .lean()
        }
    },
    forms: async(parent, {templateForm, search, skip}, {user}) => {
        let _clients;
        if(search.length>0){
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
        }
        if(user.role==='admin'){
            let forms = await FormAzyk.find({templateForm: templateForm, ...search.length>0?{client: {$in: _clients}}:{}})
                .populate({
                    path: 'client',
                    select: 'name _id address'
                })
                .sort('-createdAt')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
            return forms
        }
        else if(['суперорганизация', 'организация', 'менеджер'].includes(user.role)){
            let forms = await FormAzyk.find({templateForm: templateForm, organization: user.organization, ...search.length>0?{client: {$in: _clients}}:{}})
                .populate({
                    path: 'client',
                    select: 'name _id address'
                })
                .sort('-createdAt')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
            forms = forms.filter(form => (form.client&&form.client.name.includes(search)))
            return forms
        }
        else if('агент'===user.role){
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            if(user.onlyIntegrate){
                clients = await Integrate1CAzyk
                    .find({client: {$in: clients}, organization: user.organization})
                    .distinct('client')
                    .lean()
            }
            if(search.length>0) {
                clients = await ClientAzyk.find({
                    $and: [{_id: {$in: clients}}, {_id: {$in: _clients}}]
                }).distinct('_id').lean()
            }
            let forms = await FormAzyk.find({client: {$in: clients}, editorEmployment: true, templateForm: templateForm, organization: user.organization})
                .populate({
                    path: 'client',
                    select: 'name _id address'
                })
                .sort('-createdAt')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
            forms = forms.filter(form => (form.client&&form.client.name.includes(search)))
            return forms
        }
    },
    form: async(parent, {_id}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер'].includes(user.role)){
            let form = await FormAzyk.findOne({_id: _id, ...user.organization?{organization: user.organization}:{}})
                .populate({
                    path: 'client',
                    select: 'name _id address'
                })
                .lean()
            return form
        }
        else if(user.role==='агент'){
            let form = await FormAzyk.findOne({_id: _id, ...user.organization?{organization: user.organization}:{}, editorEmployment: true})
                .populate({
                    path: 'client',
                    select: 'name _id address'
                })
                .lean()
            return form
        }
    },
};

const resolversMutation = {
    addTemplateForm: async(parent, {title, organization, editorEmployment, editorClient, edit, questions}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер'].includes(user.role)) {
            if(user.organization) organization = user.organization
            let newTemplateForm = new TemplateFormAzyk({
                title: title,
                organization: organization,
                editorEmployment: editorEmployment,
                editorClient: editorClient,
                edit: edit,
                questions: questions
            });
            await TemplateFormAzyk.create(newTemplateForm);
        }
        return {data: 'OK'}
    },
    setTemplateForm: async(parent, {_id, title, editorEmployment, editorClient, edit, questions}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер'].includes(user.role)) {
            let templateForm = await TemplateFormAzyk.findOne({_id: _id, ...user.organization?{organization: user.organization}:{}})
            if(templateForm){
                if(title) templateForm.title = title
                if(editorEmployment!==undefined) templateForm.editorEmployment = editorEmployment
                if(editorClient!==undefined) templateForm.editorClient = editorClient
                if(edit!==undefined) templateForm.edit = edit
                templateForm.questions = questions
                await templateForm.save();
            }
        }
        return {data: 'OK'}
    },
    addForm: async(parent, {templateForm, client, questions}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'client'].includes(user.role)) {
            templateForm = await TemplateFormAzyk.findOne({_id: templateForm, ...user.organization?{organization: user.organization}:{}}).select('organization _id').lean()
            if(user.client) client = user.client
            if(templateForm) {
                let newForm = new FormAzyk({
                    organization: templateForm.organization,
                    templateForm: templateForm._id,
                    client: client,
                    ...user.employment?{agent: user.employment}:{}
                });
                for(let i = 0; i<questions.length; i++){
                    if(questions[i].file){
                        let {stream, filename} = await questions[i].file;
                        filename = await saveImage(stream, filename)
                        questions[i].answer = [urlMain + filename]
                    }
                }
                newForm.questions = questions
                await FormAzyk.create(newForm);
            }
        }
        return {data: 'OK'}
    },
    setForm: async(parent, {_id, questions}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'client'].includes(user.role)) {
            let form = await FormAzyk.findOne({_id: _id, ...user.organization?{organization: user.organization}:{}})
            if(form) {
                let templateForm = await TemplateFormAzyk.findOne({_id: form.templateForm}).select('edit').lean()
                if(templateForm.edit) {
                    for (let i = 0; i < questions.length; i++) {
                        if (questions[i].file) {
                            let {stream, filename} = await questions[i].file;
                            filename = await saveImage(stream, filename)
                            questions[i].answer = [urlMain + filename]
                        }
                    }
                    form.questions = questions
                    await form.save();
                }
            }
        }
        return {data: 'OK'}
    },
    deleteTemplateForm: async(parent, {_id}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер'].includes(user.role)) {
            await TemplateFormAzyk.deleteMany({_id: {$in: _id}})
            await FormAzyk.deleteMany({templateForm: {$in: _id}})
        }
        return {data: 'OK'}
    },
    deleteForm: async(parent, {_id}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)) {
            await FormAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    },

};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;