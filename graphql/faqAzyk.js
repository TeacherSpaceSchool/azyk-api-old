const FaqAzyk = require('../models/faqAzyk');
const { saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Faq {
    _id: ID
    url: String
    title: String
    createdAt: Date
  }
`;

const query = `
    faqs(search: String!): [Faq]
`;

const mutation = `
    addFaq(file: Upload!, title: String!): Data
    setFaq(_id: ID!, file: Upload, title: String): Data
    deleteFaq(_id: [ID]!): Data
`;

const resolvers = {
    faqs: async(parent, {search}) => {
        return await FaqAzyk.find({
            title: {'$regex': search, '$options': 'i'}
        }).sort('title')
    }
};

const resolversMutation = {
    addFaq: async(parent, {file, title}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await file;
            filename = await saveFile(stream, filename)
            let _object = new FaqAzyk({
                url: urlMain+filename,
                title: title
            });
            await FaqAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setFaq: async(parent, {_id, file, title}, {user}) => {
        if(user.role==='admin') {
            let object = await FaqAzyk.findById(_id)
            if (file) {
                let {stream, filename} = await file;
                if(object.url) await deleteFile(object.url)
                filename = await saveFile(stream, filename)
                object.url = urlMain + filename
            }
            if(title) object.title = title
            object.save();
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