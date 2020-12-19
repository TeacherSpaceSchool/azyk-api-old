const EquipmentAzyk = require('../models/equipmentAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const ClientAzyk = require('../models/clientAzyk');
const mongoose = require('mongoose')

const type = `
  type Equipment {
    _id: ID
    number: String
    name: String
    client: Client
    organization: Organization
    createdAt: Date
  }
`;

const query = `
    equipments(organization: ID!, search: String!, sort: String!): [Equipment]
    equipment(_id: ID!): Equipment
    sortEquipment: [Sort]
`;

const mutation = `
    addEquipment(number: String!, name: String!, organization: ID, client: ID): Data
    setEquipment(_id: ID!, number: String, name: String, organization: ID, client: ID): Data
    deleteEquipment(_id: [ID]!): Data
`;

const resolvers = {
    equipments: async(parent, {organization, search, sort}, {user}) => {
        if(user.organization) organization = user.organization
        let equipments =  await EquipmentAzyk.find({
            ...organization==='super'?{organization: null}:{organization: organization}
        })
            .populate({
                path: 'client',
                select: 'name'
            })
            .sort(sort)
            .lean()
        equipments = equipments.filter(
            equipment => (
                (equipment.name.toLowerCase()).includes(search.toLowerCase()) ||
                (equipment.number.toLowerCase()).includes(search.toLowerCase()) ||
                equipment.client&&(equipment.client.name.toLowerCase()).includes(search.toLowerCase())
            )
        )
        return equipments
    },
    equipment: async(parent, {_id}, {user}) => {
        let equipment = await EquipmentAzyk.findOne({_id: _id})
                .populate('client')
                .populate('organization')
        if(user.role==='admin'||user.organization.toString()===equipment.organization._id.toString())
            return equipment
        return null
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
    }
};

const resolversMutation = {
    addEquipment: async(parent, {number, name, organization, client}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            let _object = new EquipmentAzyk({
                number: number,
                name: name,
                organization: organization,
            });
            if(client)_object.client = client
            if(user.role==='admin')_object.organization = organization
            else
                _object.organization = user.organization
            await EquipmentAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setEquipment: async(parent, {_id, number, name, organization, client}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)) {
            let object = await EquipmentAzyk.findById(_id)
            if(number)object.number = number
            if(name)object.name = name
            if(client)object.client = client
            if(organization&&user.role==='admin')object.organization = organization
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteEquipment: async(parent, { _id }, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            let objects = await EquipmentAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                if(user.role==='admin'||user.organization.toString()===objects[i].organization.toString())
                    await EquipmentAzyk.deleteOne({_id: objects[i]._id})
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