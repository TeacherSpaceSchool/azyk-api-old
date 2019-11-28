const mongoose = require('mongoose');
const OrganizationAzyk = require('../models/organizationAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const ItemAzyk = require('../models/itemAzyk');
const { saveFile, deleteFile, urlMain } = require('../module/const');
const { getSubCategoryUndefinedId } = require('../module/subCategoryAzyk');

const type = `
  type Organization {
    _id: ID
    updatedAt: Date
    name: String
    address: [String]
    email: [String]
    phone: [String]
    info: String
    reiting: Int
    status: String
    image: String
  }
`;

const query = `
    organizations(search: String!, sort: String!, filter: String!): [Organization]
    organization(_id: ID!): Organization
    sortOrganization: [Sort]
    filterOrganization: [Filter]
`;

const mutation = `
    addOrganization(image: Upload!, name: String!, address: [String]!, email: [String]!, phone: [String]!, info: String!): Data
    setOrganization(_id: ID!, image: Upload, name: String, address: [String], email: [String], phone: [String], info: String): Data
    deleteOrganization(_id: [ID]!): Data
    onoffOrganization(_id: [ID]!): Data
`;

const resolvers = {
    organizations: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter
            }).sort(sort)
        } else
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                status: 'active'
            }).sort(sort)
    },
    organization: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id))
            return await OrganizationAzyk.findOne({
                    _id: _id
                })
    },
    sortOrganization: async(parent, ctx, {user}) => {
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
    filterOrganization: async(parent, ctx, {user}) => {
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
    addOrganization: async(parent, {info, phone, email, address, image, name}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await image;
            filename = await saveFile(stream, filename)
            let _object = new OrganizationAzyk({
                image: urlMain+filename,
                name: name,
                status: 'active',
                address: address,
                email: email,
                phone: phone,
                info: info,
                reiting: 0,
            });
            await OrganizationAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setOrganization: async(parent, {_id, info, phone, email, address, image, name}, {user}) => {
        if(user.role==='admin'||(user.role==='организация'&&user.organization.toString()===_id.toString())) {
            let object = await OrganizationAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveFile(stream, filename)
                object.image = urlMain + filename
            }
            if(name) object.name = name
            if(info) object.info = info
            if(phone) object.phone = phone
            if(email) object.email = email
            if(address) object.address = address
            object.save();
        }
        return {data: 'OK'}
    },
    deleteOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await OrganizationAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
            }
            await ItemAzyk.updateMany({subCategory: {$in: _id}}, {subCategory: getSubCategoryUndefinedId(), status: 'deactive'})
            await EmploymentAzyk.deleteMany({organization: {$in: _id}})
            await OrganizationAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    },
    onoffOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await OrganizationAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                objects[i].save()
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