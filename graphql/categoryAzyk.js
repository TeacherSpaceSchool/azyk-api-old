const CategoryAzyk = require('../models/categoryAzyk');
const SubCategoryAzyk = require('../models/subCategoryAzyk');
const { saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Category {
    _id: ID
    image: String
    name: String
    status: String
    createdAt: Date
  }
`;

const query = `
    categorys(search: String!, sort: String!, filter: String!): [Category]
    category(_id: ID!): Category
    sortCategory: [Sort]
    filterCategory: [Filter]
`;

const mutation = `
    addCategory(image: Upload!, name: String!): Data
    setCategory(_id: ID!, image: Upload, name: String): Data
    deleteCategory(_id: [ID]!): Data
    onoffCategory(_id: [ID]!): Data
`;

const resolvers = {
    categorys: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            let categoryUndefined = await CategoryAzyk.findOne({name: 'Не задано'})
            return [
                categoryUndefined,
                ...(await CategoryAzyk.find({
                        $and: [
                            {name: {$ne: 'Не задано'}},
                            {name: {'$regex': search, '$options': 'i'}}
                        ],
                        status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                    }).sort(sort)
                )]
        } else
            return await CategoryAzyk.find({
                $and: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {name: {$ne: 'Не задано'},}
                ],
                status: 'active'
            }).sort(sort)
    },
    category: async(parent, {_id}) => {
        if(_id!=='all')
            return await CategoryAzyk.findOne({
                _id: _id
            })
        else return null
    },
    sortCategory: async(parent, ctx, {user}) => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            }
        ]
        if(user.role==='admin') {
            sort = [
                ...sort,
                {
                    name: 'Статус',
                    field: 'status'
                }
            ]
        }
        return sort
    },
    filterCategory: async(parent, ctx, {user}) => {
        if(user.role==='admin')
            return await [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Активные',
                    value: 'active'
                },
                {
                    name: 'Неактивные',
                    value: 'deactive'
                }
            ]
        else
            return await []
    },
};

const resolversMutation = {
    addCategory: async(parent, {image, name}, {user}) => {
        if(user.role==='admin'&&name!=='Не задано'){
            let { stream, filename } = await image;
            filename = await saveFile(stream, filename)
            let _object = new CategoryAzyk({
                image: urlMain+filename,
                name: name,
                status: 'active'
            });
            await CategoryAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setCategory: async(parent, {_id, image, name}, {user}) => {
        if(user.role==='admin'&&name!=='Не задано') {
            let object = await CategoryAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveFile(stream, filename)
                object.image = urlMain + filename
            }
            if(name&&name!=='Не задано') object.name = name
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteCategory: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await CategoryAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
            }

            let categoryUndefined = await CategoryAzyk.findOne({name: 'Не задано'});
            await SubCategoryAzyk.updateMany({category: {$in: _id}}, {category: categoryUndefined._id})

            await CategoryAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    },
    onoffCategory: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await CategoryAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await objects[i].save()
            }
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;