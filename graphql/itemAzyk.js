const ItemAzyk = require('../models/itemAzyk');
const AdsAzyk = require('../models/adsAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const BasketAzyk = require('../models/basketAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const mongoose = require('mongoose');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type Item {
    _id: ID
    unit: String
    createdAt: Date
    stock: Float
    name: String
    categorys: [String]
    info: String
    image: String
    price: Float
    reiting: Int
    subCategory: SubCategory
    organization: Organization
    hit: Boolean
    latest: Boolean
    apiece: Boolean
    status: String
    packaging: Int
    weight: Float
    size: Float
    priotiry: Int
    del: String
    city: String
    costPrice: Float
  }
  input InputItemCostPrice {
    _id: ID
    costPrice: Float
  }
`;

const query = `
    items(subCategory: ID!, search: String!, sort: String!): [Item]
    popularItems: [Item]
    itemsTrash(search: String!): [Item]
    brands(organization: ID!, search: String!, sort: String!, city: String): [Item]
    item(_id: ID!): Item
    sortItem: [Sort]
`;

const mutation = `
    addItem( categorys: [String]!, city: String!, costPrice: Float, unit: String, priotiry: Int, apiece: Boolean, packaging: Int!, stock: Float!, weight: Float!, size: Float!, name: String!, info: String!, image: Upload, price: Float!, subCategory: ID!, organization: ID!, hit: Boolean!, latest: Boolean!): Data
    setItem(_id: ID!, unit: String, city: String, costPrice: Float, categorys: [String], priotiry: Int, apiece: Boolean, packaging: Int, stock: Float, weight: Float, size: Float, name: String, info: String, image: Upload, price: Float, subCategory: ID, organization: ID, hit: Boolean, latest: Boolean): Data
    setItemsCostPrice(itemsCostPrice: [InputItemCostPrice]!): Data
    deleteItem(_id: [ID]!): Data
    restoreItem(_id: [ID]!): Data
    onoffItem(_id: [ID]!): Data
    addFavoriteItem(_id: [ID]!): Data
`;

const resolvers = {
    itemsTrash: async(parent, {search}, {user}) => {
        if('admin'===user.role){
            return await ItemAzyk.find({
                    del: 'deleted',
                    $or: [
                        {name: {'$regex': search, '$options': 'i'}},
                        {info: {'$regex': search, '$options': 'i'}}
                    ]
                })
                    .populate({
                        path: 'subCategory',
                        select: '_id name'
                    })
                    .populate({
                        path: 'organization',
                        select: '_id name consignation'
                    })
                    .sort('-priotiry')
                    .lean()
        }
    },
    items: async(parent, {subCategory, search, sort}, {user}) => {
        if(['admin', 'суперагент', 'экспедитор', 'суперорганизация', 'организация', 'менеджер', 'агент', 'client'].includes(user.role)){
            let organizations
            if(user.organization)
                organizations = [user.organization, ...(await DistributerAzyk.findOne({
                    distributer: user.organization
                })
                    .distinct('sales')
                    .lean())]
            return await ItemAzyk.find({
                del: {$ne: 'deleted'},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {info: {'$regex': search, '$options': 'i'}}
                ],
                ...subCategory!=='all'?{subCategory: subCategory}:{},
                ...user.organization?{organization: {$in: organizations}}:{},
                ...user.city ? {city: user.city} : {},
                ...user.role==='client'?{status: 'active', categorys: user.category}:{}
            })
                .set('hit latest apiece image info name stock price status del _id organization')
                .populate({
                    path: 'organization',
                    select: '_id'
                })
                .sort('-priotiry')
                .sort(sort)
                .lean()
        }
    },
    popularItems: async(parent, ctx, {user}) => {
        let approveOrganizations = {}
        let itemsRes = []
        let items =  await ItemAzyk.find({
            status: 'active',
            del: {$ne: 'deleted'},
            city: user.city,
            $or: [
                {hit: true},
                {latest:true}
            ],
            ...user.role==='client'?{categorys: user.category}:{}
        })
            .select('_id name image organization hit latest')
            .populate({
                path: 'organization',
                select: '_id onlyIntegrate onlyDistrict'
            })
            .sort('-priotiry')
            .sort('-updatedAt')
            .lean()
        for(let i=0; i<items.length; i++){
            if (!approveOrganizations[items[i].organization._id]) {
                if (items[i].organization.onlyIntegrate && items[i].organization.onlyDistrict) {
                    let district = await DistrictAzyk.findOne({
                        client: user.client,
                        organization: items[i].organization._id
                    }).select('_id').lean()
                    let integrate = await Integrate1CAzyk.findOne({
                        client: user.client,
                        organization: items[i].organization._id
                    }).select('_id').lean()
                    approveOrganizations[items[i].organization._id] = integrate && district;
                }
                else if (items[i].organization.onlyDistrict) {
                    let district = await DistrictAzyk.findOne({
                        client: user.client,
                        organization: items[i].organization._id
                    }).select('_id').lean()
                    approveOrganizations[items[i].organization._id] = district
                }
                else if (items[i].organization.onlyIntegrate) {
                    let integrate = await Integrate1CAzyk.findOne({
                        client: user.client,
                        organization: items[i].organization._id
                    }).select('_id').lean()
                    approveOrganizations[items[i].organization._id] = integrate
                }
                else approveOrganizations[items[i].organization._id] = true
            }
            if(approveOrganizations[items[i].organization._id])
                itemsRes.push(items[i])
        }
        itemsRes = itemsRes.sort( () => {
            return Math.random() - 0.5;
        });
        return itemsRes
    },
    brands: async(parent, {organization, search, sort, city}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)) {
            return await ItemAzyk.find({
                ...user.role === 'admin' ? {} : {status: 'active'},
                organization: organization,
                del: {$ne: 'deleted'},
                ...city ? {city: city} : {},
                ...user.city ? {city: user.city} : {},
                ...user.role === 'client' ? {categorys: user.category, city: user.city} : {},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {info: {'$regex': search, '$options': 'i'}}
                ]
            })
                .populate({
                    path: 'subCategory',
                    select: '_id name'
                })
                .populate({
                    path: 'organization',
                    select: '_id name consignation'
                })
                .sort('-priotiry')
                .sort(sort)
                .lean()
        }
        else return []

    },
    item: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await ItemAzyk.findOne({
                _id: _id,
            })
                .populate({
                    path: 'subCategory',
                    select: '_id name',
                    populate: {
                        path: 'category',
                        select: 'name _id'
                    }
                })
                .populate({
                    path: 'organization',
                    select: '_id name minimumOrder consignation'
                })
                .lean()
        } else return null
    },
    sortItem: async(parent, ctx, {user}) => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            },
            {
                name: 'Цена',
                field: 'price'
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
    }
};

const resolversMutation = {
    addItem: async(parent, {categorys, city, unit, apiece, costPrice, priotiry, stock, name, image, info, price, subCategory, organization, hit, latest, packaging, weight, size}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let _object = new ItemAzyk({
                stock: stock,
                name: name,
                image: urlMain+filename,
                info: info,
                price: price,
                reiting: 0,
                subCategory: subCategory,
                organization: user.organization?user.organization:organization,
                hit: hit,
                categorys: categorys,
                packaging: packaging,
                latest: latest,
                status: 'active',
                weight: weight,
                size: size,
                priotiry: priotiry,
                unit: unit,
                city: city,
                costPrice: costPrice?costPrice:0
            });
            if(apiece!=undefined) _object.apiece = apiece
            await ItemAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setItem: async(parent, {city, unit, categorys, apiece, costPrice, _id, priotiry, weight, size, stock, name, image, info, price, subCategory, organization, packaging, hit, latest}, {user}) => {
         if(['admin', 'суперорганизация', 'организация'].includes(user.role)) {
            let object = await ItemAzyk.findOne({
                _id: _id,
                ...user.organization?{organization: user.organization}:{},
            })
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(city)object.city = city
            if(name)object.name = name
            if(weight!=undefined)object.weight = weight
            if(size!=undefined)object.size = size
            if(info)object.info = info
            if(stock!=undefined)object.stock = stock
            if(costPrice!=undefined)object.costPrice = costPrice
            if(price)object.price = price
            if(hit!=undefined)object.hit = hit
            if(latest!=undefined)object.latest = latest
            if(subCategory)object.subCategory = subCategory
            if(unit)object.unit = unit
            if(packaging)object.packaging = packaging
            if(apiece!=undefined) object.apiece = apiece
            if(priotiry!=undefined) object.priotiry = priotiry
            if(categorys!=undefined) object.categorys = categorys
            if(user.role==='admin'&&organization){
                object.organization = organization;
            }
            await object.save();
        }
        return {data: 'OK'}
    },
    setItemsCostPrice: async(parent, { itemsCostPrice }, {user}) => {
        if(user.role==='admin') {
            let object
            for (let i = 0; i < itemsCostPrice.length; i++) {
                object = await ItemAzyk.findOne({_id: itemsCostPrice[i]._id})
                object.costPrice = itemsCostPrice[i].costPrice
                await object.save()
            }
        }
        return {data: 'OK'}
    },
    onoffItem: async(parent, { _id }, {user}) => {
        let objects = await ItemAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'|| (['суперорганизация', 'организация'].includes(user.role)&&user.organization.toString()===objects[i].organization.toString())){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await objects[i].save()
                await BasketAzyk.deleteMany({item: {$in: objects[i]._id}})
            }
        }
        return {data: 'OK'}
    },
    deleteItem: async(parent, { _id }, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)) {
            await ItemAzyk.updateMany({_id: {$in: _id}}, {
                del: 'deleted',
                status: 'deactive'
            })
            let objects = await ItemAzyk.find({_id: {$in: _id}, ...user.organization?{organization: user.organization}:{}})
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
                objects[i].del = 'deleted'
                objects[i].status = 'deactive'
                await objects[i].save()
            }
            objects = await AdsAzyk.find({item: {$in: _id}}).select('image').lean()
            for (let i = 0; i < objects.length; i++) {
                await deleteFile(objects[i].image)
            }
            await AdsAzyk.updateMany({_id: {$in: _id}}, {del: 'deleted'})
            await BasketAzyk.deleteMany({item: {$in: _id}})
            await Integrate1CAzyk.deleteMany({item: {$in: _id}})
        }
        return {data: 'OK'}
    },
    restoreItem: async(parent, { _id }, {user}) => {
        if(user.role==='admin') {
            await ItemAzyk.updateMany({_id: {$in: _id}}, {del: null, status: 'active'})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;