const EquipmentAzyk = require('../models/equipmentAzyk');
const RepairEquipmentAzyk = require('../models/repairEquipmentAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const ClientAzyk = require('../models/clientAzyk');
const mongoose = require('mongoose')
const randomstring = require('randomstring');

const type = `
  type Equipment {
    _id: ID
    number: String
    name: String
    client: Client
    organization: Organization
    createdAt: Date
  }
  type RepairEquipment {
    _id: ID
    createdAt: Date
    number: String
    status: String
    equipment: Equipment
    repairMan: Employment
    agent: Employment
    organization: Organization
    accept: Boolean
    done: Boolean
    cancel: Boolean
    defect: [String]
    repair: [String]
    dateRepair: Date
  }
`;

const query = `
    equipments(organization: ID!, search: String!, sort: String!): [Equipment]
    equipment(_id: ID!): Equipment
    sortEquipment: [Sort]
    repairEquipments(organization: ID!, search: String!, filter: String!): [RepairEquipment]
    repairEquipment(_id: ID!): RepairEquipment
    filterRepairEquipment: [Filter]
`;

const mutation = `
    addEquipment(number: String!, name: String!, organization: ID, client: ID): Data
    setEquipment(_id: ID!, number: String, name: String, client: ID): Data
    deleteEquipment(_id: [ID]!): Data
    addRepairEquipment(organization: ID, equipment: ID!, defect: [String]): Data
    setRepairEquipment(_id: ID!, equipment: ID, accept: Boolean, done: Boolean, cancel: Boolean, defect: [String], repair: [String]): Data
    deleteRepairEquipment(_id: [ID]!): Data
`;

const resolvers = {
    equipments: async(parent, {organization, search, sort}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(user.role)) {
            let districtClients = []
            let _clients = [];
            if(search.length>0) {
                _clients = await ClientAzyk.find({
                    del: {$ne: 'deleted'},
                    $or: [{name: {'$regex': search, '$options': 'i'}},{info: {'$regex': search, '$options': 'i'}}, {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}}]})
                    .distinct('_id')
                    .lean()
            }
            if(['агент', 'менеджер'].includes(user.role)){
                districtClients = await DistrictAzyk
                    .find({$or: [{manager: user.employment}, {agent: user.employment}]})
                    .distinct('client')
                    .lean()
            }
            return await EquipmentAzyk.find({
                organization: user.organization ? user.organization : organization === 'super' ? null : organization,
                $and: [
                    {$or: [
                        {name: {'$regex': search, '$options': 'i'}},
                        {number: {'$regex': search, '$options': 'i'}},
                        {...search.length>0?{client: {$in: _clients}}:{}},
                    ]},
                    {...['агент', 'менеджер'].includes(user.role)?{client: {$in: districtClients}}:{}}
                ]
            })
                .populate({
                    path: 'client',
                    select: '_id name address'
                })
                .sort(sort)
                .lean()
        }
    },
    equipment: async(parent, {_id}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(user.role)) {
            return await EquipmentAzyk.findOne({
                _id: _id,
                ...user.organization?{organization: user.organization}:{},
            })
                .populate({
                    path: 'client',
                    select: '_id name address'
                })
                .populate({
                    path: 'organization',
                    select: '_id name'
                })
                .lean()
        }
    },
    repairEquipments: async(parent, {organization, search, filter}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(user.role)) {
            let equipments = []
            if(['агент', 'менеджер'].includes(user.role)){
                equipments = await DistrictAzyk
                    .find({agent: user.employment})
                    .distinct('client')
                    .lean()
                equipments = await EquipmentAzyk
                    .find({client: {$in: equipments}})
                    .distinct('_id')
                    .lean()
            }
            let _equipments = [];
            let _agents = [];
            if(search.length>0) {
                _equipments = await ClientAzyk.find({del: {$ne: 'deleted'}, $or: [{name: {'$regex': search, '$options': 'i'}},{info: {'$regex': search, '$options': 'i'}}, {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}}]})
                    .distinct('_id').lean()
                _equipments = await EquipmentAzyk
                    .find({organization: user.organization?user.organization:organization==='super'?null:organization, client: {$in: _equipments}})
                    .distinct('_id')
                    .lean()
                _agents = await EmploymentAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id').lean()
            }
            let repairEquipments = await RepairEquipmentAzyk.find({
                organization: user.organization?user.organization:organization==='super'?null:organization,
                status: {'$regex': filter, '$options': 'i'},
                $and: [
                    {...['агент', 'менеджер'].includes(user.role)?{equipment: {$in: equipments}}:{}},
                    {...(search.length>0?{
                        $or: [
                            {number: {'$regex': search, '$options': 'i'}},
                            {equipment: {$in: _equipments}},
                            {agent: {$in: _agents}},
                            {repairMan: {$in: _agents}},
                        ]
                    }
                    :{})}
                ]
            })
                .populate({
                    path: 'equipment',
                    select: '_id number name client',
                    populate: {
                        path: 'client',
                        select: 'name _id address'
                    }
                })
                .populate({
                    path: 'agent',
                    select: '_id name'
                })
                .populate({
                    path: 'repairMan',
                    select: '_id name'
                })
                .populate({
                    path: 'organization',
                    select: '_id name'
                })
                .sort('-createdAt')
                .lean()
            return repairEquipments
        }
    },
    repairEquipment: async(parent, {_id}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'ремонтник'].includes(user.role)) {
            return await RepairEquipmentAzyk.findOne({
                _id: _id,
                ...user.organization ? {organization: user.organization} : {}
            })
                .populate({
                    path: 'equipment',
                    select: '_id number name client',
                    populate: {
                        path: 'client',
                        select: 'name _id address'
                    }
                })
                .populate({
                    path: 'agent',
                    select: '_id name'
                })
                .populate({
                    path: 'repairMan',
                    select: '_id name'
                })
                .populate({
                    path: 'organization',
                    select: '_id name'
                })
                .lean()
        }
    },
    sortEquipment: async() => {
        return [
            {
                name: 'Имя',
                field: 'name'
            },
            {
                name: 'Дата',
                field: '-createdAt'
            },
        ]
    },
    filterRepairEquipment: async() => {
        let filter = [
            {
                name: 'Все',
                value: ''
            },
            {
                name: 'Обработка',
                value: 'обработка'
            },
            {
                name: 'Отмена',
                value: 'отмена'
            },
            {
                name: 'Принят',
                value: 'принят'
            },
            {
                name: 'Выполнен',
                value: 'выполнен'
            }
        ]
        return filter
    },
};

const resolversMutation = {
    addEquipment: async(parent, {number, name, organization, client}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'агент'].includes(user.role)){
            let _object = new EquipmentAzyk({
                number: number,
                name: name,
                organization: user.organization?user.organization:organization,
            });
            if(client)_object.client = client
            await EquipmentAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setEquipment: async(parent, {_id, number, name, client}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'агент'].includes(user.role)) {
            let object = await EquipmentAzyk.findById(_id)
            if(number)object.number = number
            if(name)object.name = name
            if(client)object.client = client
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteEquipment: async(parent, { _id }, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            await EquipmentAzyk.deleteMany({_id: {$in: _id}, ...user.organization?{organization: user.organization}:{}})
        }
        return {data: 'OK'}
    },
    addRepairEquipment: async(parent, {equipment, defect, organization}, {user}) => {
        if(['агент', 'admin', 'суперагент', 'суперорганизация', 'организация'].includes(user.role)){
            let number = randomstring.generate({length: 12, charset: 'numeric'});
            while (await RepairEquipmentAzyk.findOne({number: number}).select('_id').lean())
                number = randomstring.generate({length: 12, charset: 'numeric'});
            let _object = new RepairEquipmentAzyk({
                number: number,
                status: 'обработка',
                equipment: equipment,
                agent: user.employment?user.employment:null,
                organization: user.organization?user.organization:organization,
                accept: false,
                done: false,
                cancel: false,
                defect: defect,
                repair: [],
                dateRepair: null,
                repairMan: null
            });
            await RepairEquipmentAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setRepairEquipment: async(parent, {_id, accept, done, cancel, defect, repair, equipment}, {user}) => {
        if(['агент', 'admin', 'суперагент', 'суперорганизация', 'организация', 'ремонтник'].includes(user.role)) {
            let object = await RepairEquipmentAzyk.findById(_id)
            if(user.role==='ремонтник')object.repairMan = user.employment
            if(defect&&!object.accept&&!object.cancel)object.defect = defect
            if(equipment&&!object.accept&&!object.cancel)object.equipment = equipment
            if(repair&&(object.accept||accept)&&!object.done)object.repair = repair
            if(accept!==undefined&&!object.cancel){
                object.accept = accept
                object.status = 'принят'
            }
            if(done!==undefined&&object.accept){
                object.done = done
                object.dateRepair = new Date()
                object.status = 'выполнен'
            }
            if(cancel!==undefined&&!object.accept){
                object.cancel = cancel
                object.status = 'отмена'
            }
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteRepairEquipment: async(parent, { _id }, {user}) => {
        if(['агент', 'admin', 'суперагент', 'суперорганизация', 'организация'].includes(user.role)){
            await RepairEquipmentAzyk.deleteMany({_id: {$in: _id}, ...user.organization?{organization: user.organization}:{}})
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;