const mongoose = require('mongoose');
const OrganizationAzyk = require('../models/organizationAzyk');
const BonusAzyk = require('../models/bonusAzyk');
const AutoAzyk = require('../models/autoAzyk');
const EquipmentAzyk = require('../models/equipmentAzyk');
const BonusClientAzyk = require('../models/bonusClientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const DeliveryDateAzyk = require('../models/deliveryDateAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const AgentRouteAzyk = require('../models/agentRouteAzyk');
const ItemAzyk = require('../models/itemAzyk');
const BasketAzyk = require('../models/basketAzyk');
const UserAzyk = require('../models/userAzyk');
const AdsAzyk = require('../models/adsAzyk');
const PlanAzyk = require('../models/planAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type Organization {
    _id: ID
    createdAt: Date
    name: String
    address: [String]
    email: [String]
    phone: [String]
    info: String
    miniInfo: String
    reiting: Int
    status: String
    image: String
    warehouse: String
    minimumOrder: Int
    accessToClient: Boolean
    unite: Boolean
    addedClient: Boolean
    superagent: Boolean
    consignation: Boolean
    onlyDistrict: Boolean
    onlyIntegrate: Boolean
    autoAccept: Boolean
    cities: [String]
    del: String
    priotiry: Int
    pass: String
  }
`;

const query = `
    brandOrganizations(search: String!, sort: String!, filter: String!, city: String): [Organization]
    organizations(search: String!, sort: String!, filter: String!, city: String): [Organization]
    organizationsTrash(search: String!): [Organization]
    organization(_id: ID!): Organization
    sortOrganization: [Sort]
    filterOrganization: [Filter]
`;

const mutation = `
    addOrganization(cities: [String]!, pass: String, warehouse: String!, miniInfo: String!, priotiry: Int, minimumOrder: Int, image: Upload!, name: String!, address: [String]!, email: [String]!, phone: [String]!, info: String!, accessToClient: Boolean!, consignation: Boolean!, addedClient: Boolean!, unite: Boolean!, superagent: Boolean!, onlyDistrict: Boolean!, onlyIntegrate: Boolean!, autoAccept: Boolean!): Data
    setOrganization(cities: [String], pass: String, warehouse: String, miniInfo: String, _id: ID!, priotiry: Int, minimumOrder: Int, image: Upload, name: String, address: [String], email: [String], phone: [String], info: String, accessToClient: Boolean, consignation: Boolean, addedClient: Boolean, unite: Boolean, superagent: Boolean, onlyDistrict: Boolean, onlyIntegrate: Boolean, autoAccept: Boolean): Data
    restoreOrganization(_id: [ID]!): Data
    deleteOrganization(_id: [ID]!): Data
    onoffOrganization(_id: [ID]!): Data
`;

const resolvers = {
    brandOrganizations: async(parent, {search, sort, filter, city}, {user}) => {
        let brandOrganizations = await ItemAzyk.find({
            ...user.role==='admin'?{}:{status: 'active'},
            del: {$ne: 'deleted'}
        }).distinct('organization')
        if('admin'===user.role){
            return await OrganizationAzyk.find({
                _id: {$in: brandOrganizations},
                name: {'$regex': search, '$options': 'i'},
                status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter,
                ...city?{cities: city}:{},
                del: {$ne: 'deleted'}
            })
                .sort('-priotiry')
                .sort(sort)
        }
        else if('суперагент'===user.role){
            return await OrganizationAzyk.find({
                _id: {$in: brandOrganizations},
                name: {'$regex': search, '$options': 'i'},
                status: filter.length === 0 ? {'$regex': filter, '$options': 'i'} : filter,
                del: {$ne: 'deleted'},
                superagent: true
            })
                .sort('-priotiry')
                .sort(sort)
        }
        else if(['суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)){
            brandOrganizations = await DistributerAzyk.findOne({
                distributer: user.organization
            }).distinct('sales')
            brandOrganizations = [...brandOrganizations, user.organization]
            return await OrganizationAzyk.find({
                _id: {$in: brandOrganizations},
                name: {'$regex': search, '$options': 'i'},
                status: 'active',
                del: {$ne: 'deleted'}
            })
                .sort('-priotiry')
                .sort(sort)
        }
        else if(user.role==='client') {
            let organizationsRes = []
            const organizations = await OrganizationAzyk.find({
                _id: {$in: brandOrganizations},
                name: {'$regex': search, '$options': 'i'},
                status: 'active',
                del: {$ne: 'deleted'},
                cities: user.city
            })
                .sort('-priotiry')
                .sort(sort)
            for(let i=0; i<organizations.length; i++) {
                if(organizations[i].onlyIntegrate&&organizations[i].onlyDistrict){
                    let district = await DistrictAzyk.findOne({client: user.client, organization: organizations[i]._id}).select('_id').lean()
                    let integrate = await Integrate1CAzyk.findOne({client: user.client, organization: organizations[i]._id}).select('_id').lean()
                    if(integrate&&district){
                        organizationsRes.push(organizations[i])
                    }
                }
                else if(organizations[i].onlyDistrict){
                    let district = await DistrictAzyk.findOne({client: user.client, organization: organizations[i]._id}).select('_id').lean()
                    if(district){
                        organizationsRes.push(organizations[i])
                    }
                }
                else if(organizations[i].onlyIntegrate){
                    let integrate = await Integrate1CAzyk.findOne({client: user.client, organization: organizations[i]._id}).select('_id').lean()
                    if(integrate){
                        organizationsRes.push(organizations[i])
                    }
                }
                else organizationsRes.push(organizations[i])

            }
            return organizationsRes
        }
    },
    organizations: async(parent, {search, sort, filter, city}, {user}) => {
        if(user.role==='admin'){
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter,
                ...city?{cities: city}:{},
                del: {$ne: 'deleted'}
            })
                .sort('-priotiry')
                .sort(sort)
        } else
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                status: 'active',
                del: {$ne: 'deleted'}
            })
                .sort('-priotiry')
                .sort(sort)
    },
    organizationsTrash: async(parent, {search}, {user}) => {
        if(user.role==='admin'){
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                del: 'deleted'
            })
                .sort('-createdAt')
        }
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
    addOrganization: async(parent, {cities, addedClient, autoAccept, pass, warehouse, superagent, unite, miniInfo, priotiry, info, phone, email, address, image, name, minimumOrder, accessToClient, consignation, onlyDistrict, onlyIntegrate}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let objectOrganization = new OrganizationAzyk({
                image: urlMain+filename,
                name: name,
                status: 'active',
                address: address,
                email: email,
                phone: phone,
                info: info,
                minimumOrder: minimumOrder,
                reiting: 0,
                accessToClient: accessToClient,
                consignation: consignation,
                priotiry: priotiry,
                onlyDistrict: onlyDistrict,
                unite: unite,
                superagent: superagent,
                onlyIntegrate: onlyIntegrate,
                miniInfo: miniInfo,
                warehouse: warehouse,
                cities: cities,
                autoAccept: autoAccept,
                addedClient: addedClient
            });
            if(pass)
                objectOrganization.pass = pass
            objectOrganization = await OrganizationAzyk.create(objectOrganization)
            let objectBonus = new BonusAzyk({
                target: 0,
                bonus: 0,
                organization: objectOrganization._id
            });
            await BonusAzyk.create(objectBonus)
        }
        return {data: 'OK'};
    },
    setOrganization: async(parent, {cities, addedClient, autoAccept, pass, warehouse, miniInfo, superagent, unite, _id, priotiry, info, phone, email, address, image, name, minimumOrder, accessToClient, consignation, onlyDistrict, onlyIntegrate}, {user}) => {
        if(user.role==='admin'||(['суперорганизация', 'организация'].includes(user.role)&&user.organization.toString()===_id.toString())) {
            let object = await OrganizationAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(pass!==undefined) object.pass = pass
            if(cities) object.cities = cities
            if(name) object.name = name
            if(info) object.info = info
            if(phone) object.phone = phone
            if(email) object.email = email
            if(address) object.address = address
            if(warehouse) object.warehouse = warehouse
            if(superagent!=undefined) object.superagent = superagent
            if(unite!=undefined) object.unite = unite
            if(onlyDistrict!=undefined) object.onlyDistrict = onlyDistrict
            if(autoAccept!=undefined) object.autoAccept = autoAccept
            if(onlyIntegrate!=undefined) object.onlyIntegrate = onlyIntegrate
            if(priotiry!=undefined) object.priotiry = priotiry
            if(consignation!=undefined) object.consignation = consignation
            if(accessToClient!=undefined) object.accessToClient = accessToClient
            if(minimumOrder!=undefined) object.minimumOrder = minimumOrder
            if(miniInfo!=undefined) object.miniInfo = miniInfo
            if(addedClient!=undefined) object.addedClient = addedClient
            await object.save();
        }
        return {data: 'OK'}
    },
    restoreOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            await OrganizationAzyk.updateMany({_id: {$in: _id}}, {del: null, status: 'active'})
        }
        return {data: 'OK'}
    },
    deleteOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            for(let i=0; i<_id.length; i++) {
                let items = await ItemAzyk.find({organization: _id[i]}).distinct('_id')
                await BasketAzyk.deleteMany({item: {$in: items}})
                await ItemAzyk.updateMany({organization: _id[i]}, {del: 'deleted', status: 'deactive'})
                let users = await EmploymentAzyk.find({organization: _id[i]}).distinct('user')
                await UserAzyk.updateMany({_id: {$in: users}}, {status: 'deactive'})
                await EmploymentAzyk.updateMany({organization: _id[i]}, {del: 'deleted'})
                await Integrate1CAzyk.deleteMany({organization: _id[i]})
                await AgentRouteAzyk.deleteMany({organization: _id[i]})
                await DistrictAzyk.deleteMany({organization: _id[i]})
                await DistributerAzyk.deleteMany({distributer: _id[i]})
                let distributers = await DistributerAzyk.find({
                    $or: [
                        {sales: _id[i]},
                        {provider: _id[i]}
                    ]
                })
                for(let i=0; i<distributers.length; i++){
                        distributers[i].sales.splice(_id[i], 1)
                        distributers[i].provider.splice(_id[i], 1)
                    await distributers[i].save()
                }
                let bonus = await BonusAzyk.find({organization: _id[i]});
                bonus = bonus.map(element=>element._id)
                await BonusClientAzyk.deleteMany({bonus: {$in: bonus}})
                await BonusAzyk.deleteMany({organization: _id[i]})
                await AutoAzyk.deleteMany({organization: _id[i]})
                await EquipmentAzyk.deleteMany({organization: _id[i]})
                await OrganizationAzyk.updateMany({_id: _id[i]}, {del: 'deleted', status: 'deactive'})
                await AdsAzyk.updateMany({organization: _id[i]}, {del: 'deleted'})
                await PlanAzyk.deleteMany({organization: _id[i]})
                await DeliveryDateAzyk.deleteMany({organization: _id[i]})
            }
        }
        return {data: 'OK'}
    },
    onoffOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await OrganizationAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await EmploymentAzyk.updateMany({organization: objects[i]._id}, {status: objects[i].status})
                let items = await ItemAzyk.find({organization: objects[i]._id})
                items = items.map(element=>element._id)
                await BasketAzyk.deleteMany({item: {$in: items}})
                await ItemAzyk.updateMany({organization: objects[i]._id}, {status: objects[i].status})
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