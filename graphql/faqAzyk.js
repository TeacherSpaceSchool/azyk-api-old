const FaqAzyk = require('../models/faqAzyk');
const { saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Faq {
    _id: ID
    url: String
    title: String
    video: String
    typex: String
    createdAt: Date
  }
`;

const query = `
    faqs(search: String!): [Faq]
`;

const mutation = `
    addFaq(file: Upload, title: String!, typex: String!, video: String): Data
    setFaq(_id: ID!, file: Upload, title: String, typex: String, video: String): Data
    deleteFaq(_id: [ID]!): Data
`;

const resolvers = {
    faqs: async(parent, {search}, {user}) => {
        let typex = ''
        if(user.role==='client')
            typex='клиенты'
        else if(['суперорганизация', 'организация', 'менеджер', 'экспедитор', 'агент'].includes(user.role))
            typex='сотрудники'
        let res =  await FaqAzyk.find({
            title: {'$regex': search, '$options': 'i'},
        }).sort('title')
        res = res.filter(res=>res.typex.includes(typex))
        return res
    }
};

const resolversMutation = {
    addFaq: async(parent, {file, title, video, typex}, {user}) => {
        if(user.role==='admin') {
            let _object = new FaqAzyk({
                title: title,
                typex: typex
            });
            if (file) {
                let {stream, filename} = await file;
                filename = await saveFile(stream, filename)
                _object.url = urlMain+filename
            }
            if(video)_object.video = video
            await FaqAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setFaq: async(parent, {_id, file, title, video, typex}, {user}) => {
        if(user.role==='admin') {
            let object = await FaqAzyk.findById(_id)
            if (file) {
                let {stream, filename} = await file;
                if(object.url) await deleteFile(object.url)
                 filename = await saveFile(stream, filename)
                object.url = urlMain + filename
            }
            if(title) object.title = title
            if(video) object.video = video
            if(typex) object.typex = typex
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteFaq: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await FaqAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                if(objects[i].file)
                    await deleteFile(objects[i].file)
            }
            await FaqAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;