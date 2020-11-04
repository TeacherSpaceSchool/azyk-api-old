const SubCategoryAzyk = require('../models/subCategoryAzyk');
const ItemAzyk = require('../models/itemAzyk');
const BasketAzyk = require('../models/basketAzyk');
const mongoose = require('mongoose');

const type = `
  type SubCategory {
    _id: ID
    category: Category
    name: String
    status: String
    createdAt: Date
  }
`;

const query = `
    subCategorys(category: ID!, search: String!, sort: String!, filter: String!): [SubCategory]
    subCategory(_id: ID!): SubCategory
    sortSubCategory: [Sort]
    filterSubCategory: [Filter]
`;

const mutation = `
    addSubCategory(name: String!, category: ID!): Data
    setSubCategory(_id: ID!, name: String, category: ID): Data
    deleteSubCategory(_id: [ID]!): Data
    onoffSubCategory(_id: [ID]!): Data
`;

const resolvers = {
    subCategorys: async(parent, {category, search, sort, filter}, {user}) => {
        if(category==='all'||mongoose.Types.ObjectId.isValid(category)){
            if(user.role==='admin'){
                let subCategoryUndefined = await SubCategoryAzyk.findOne({name: 'Не задано'})
                if(category!=='all'){
                    return [
                        subCategoryUndefined,
                        ...(await SubCategoryAzyk.find({
                            $and: [
                                {name: {$ne: 'Не задано'}},
                                {name: {'$regex': search, '$options': 'i'}}
                            ],
                            category: category,
                            status:  filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                        }).populate('category').sort(sort))
                    ]
                }
                else {
                    return [
                        subCategoryUndefined,
                        ...(await SubCategoryAzyk.find({
                            $and: [
                                {name: {'$regex': search, '$options': 'i'}},
                                {name: {$ne: 'Не задано'},}
                            ],
                            status:  filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                        }).populate('category').sort(sort))
                    ]
                }
            }
            else if(['экспедитор', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)) {
                let subCategorys =  await ItemAzyk.find({organization: user.organization, del: {$ne: 'deleted'}}).distinct('subCategory')
                if(category!=='all'){
                    return await SubCategoryAzyk.find({
                            _id: {$in: subCategorys},
                            $and: [
                                {name: {$ne: 'Не задано'}},
                                {name: {'$regex': search, '$options': 'i'}}
                            ],
                            category: category,
                            status:  filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                        })
                        .populate('category')
                        .sort(sort)
                }
                else {
                    return await SubCategoryAzyk.find({
                            _id: {$in: subCategorys},
                            $and: [
                                {name: {'$regex': search, '$options': 'i'}},
                                {name: {$ne: 'Не задано'},}
                            ],
                            status:  filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                        })
                        .populate('category')
                        .sort(sort)
                }
            }
            else {
                if(category!=='all')
                    return await SubCategoryAzyk.find({
                        $and: [
                            {name: {'$regex': search, '$options': 'i'}},
                            {name: {$ne: 'Не задано'},}
                        ],
                        category: category,
                        status: 'active'
                    }).populate('category').sort(sort)
                else
                    return await SubCategoryAzyk.find({
                        $and: [
                            {name: {'$regex': search, '$options': 'i'}},
                            {name: {$ne: 'Не задано'},}
                        ],
                        status: 'active'
                    }).populate('category').sort(sort)

            }

        }
        else return []
    },
    subCategory: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id))
            return await SubCategoryAzyk.findOne({
                _id: _id
            }).populate('category')
        return null
    },
    sortSubCategory: async(parent, ctx, {user}) => {
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
    filterSubCategory: async(parent, ctx, {user}) => {
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
    addSubCategory: async(parent, {category, name}, {user}) => {
        if(user.role==='admin'&&name!=='Не задано'){
            let _object = new SubCategoryAzyk({
                category: category,
                name: name,
                status: 'active'
            });
            await SubCategoryAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setSubCategory: async(parent, {_id, name, category}, {user}) => {
        if(user.role==='admin'&&name!=='Не задано') {
            let object = await SubCategoryAzyk.findById(_id)
            if(name&&name!=='Не задано')object.name = name
            if(category)object.category = category
            await object.save();
        }
        return {data: 'OK'}
    },
    onoffSubCategory: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await SubCategoryAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await objects[i].save()
            }
        }
        return {data: 'OK'}
    },
    deleteSubCategory: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let subCategoryUndefined = await SubCategoryAzyk.findOne({name: 'Не задано'});
            let items = await ItemAzyk.find({subCategory: {$in: _id}})
            items = items.map(element=>element._id)
            await ItemAzyk.updateMany({_id: {$in: items}}, {subCategory: subCategoryUndefined._id, status: 'deactive'})
            await BasketAzyk.deleteMany({item: {$in: items}})
            await SubCategoryAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;