const DistrictAzyk = require('../models/districtAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const mongoose = require('mongoose');
const ClientAzyk = require('../models/clientAzyk');
const ItemAzyk = require('../models/itemAzyk');
const OrderAzyk = require('../models/orderAzyk');
const AgentRouteAzyk = require('../models/agentRouteAzyk');
const OutXMLAdsShoroAzyk = require('../models/integrate/outXMLAdsShoroAzyk');

const type = `
  type District {
      _id: ID
      createdAt: Date
      organization: Organization
      client: [Client]
      name: String
      agent: Employment
      ecspeditor: Employment
      manager: Employment
  }
`;

const query = `
    districts(organization: ID, search: String!, sort: String!): [District]
    district(_id: ID): District
    sortDistrict: [Sort]
    clientsWithoutDistrict(organization: ID): [Client]
`;

const mutation = `
    addDistrict(organization: ID, client: [ID]!, name: String!, agent: ID, manager: ID, ecspeditor: ID): Data
    setDistrict(_id: ID!, client: [ID], name: String, agent: ID, manager: ID, ecspeditor: ID): Data
    deleteDistrict(_id: [ID]!): Data
`;

const resolvers = {
    districts: async(parent, {organization, search, sort}, {user}) => {
        let clients
        if(search.length>0){
            clients = await ClientAzyk
                .find({
                    del: {$ne: 'deleted'},
                    $or: [
                        {name: {'$regex': search, '$options': 'i'}},
                        {email: {'$regex': search, '$options': 'i'}},
                        {city: {'$regex': search, '$options': 'i'}},
                        {info: {'$regex': search, '$options': 'i'}},
                        {device: {'$regex': search, '$options': 'i'}},
                        {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                        {phone: {'$regex': search, '$options': 'i'}}
                    ]
                }).distinct('_id')
            clients = clients.map(client=>client.toString())
            }
        if(user.role==='admin'){
            if(organization==='super'){
                let districts = await DistrictAzyk.find({organization: null})
                    .populate('agent')
                    .populate('ecspeditor')
                    .populate('organization')
                    .populate('manager')
                    .sort(sort)
                if(search.length>0)
                    districts = districts.filter(
                        district =>
                            (district.name.toLowerCase()).includes(search.toLowerCase()) ||
                            (district.agent && district.agent.name.toLowerCase().includes(search.toLowerCase())) ||
                            (district.organization && district.organization.name.toLowerCase().includes(search.toLowerCase())) ||
                            (district.ecspeditor && district.ecspeditor.name.toLowerCase().includes(search.toLowerCase())) ||
                            (district.manager && district.manager.name.toLowerCase().includes(search.toLowerCase())) ||
                            ((district.client.filter(client => clients.includes(client.toString()))).length)
                    )
                return districts
            }
            else {
                let districts = await DistrictAzyk.find({organization: organization})
                    .populate('agent')
                    .populate('ecspeditor')
                    .populate('organization')
                    .populate('manager')
                    .sort(sort)
                if(search.length>0)
                    districts = districts.filter(
                        district => (district.name.toLowerCase()).includes(search.toLowerCase()) ||
                            (district.agent && district.agent.name.toLowerCase().includes(search.toLowerCase())) ||
                            (district.organization && district.organization.name.toLowerCase().includes(search.toLowerCase())) ||
                            (district.ecspeditor && district.ecspeditor.name.toLowerCase().includes(search.toLowerCase())) ||
                            (district.manager && district.manager.name.toLowerCase().includes(search.toLowerCase())) ||
                            ((district.client.filter(client => clients.includes(client.toString()))).length)
                    )
                return districts
            }
        }
        else if(['суперорганизация', 'организация'].includes(user.role)){
            let districts =  await DistrictAzyk.find({
                $or: [
                    {organization: user.organization},
                ]

            })
                .populate('agent')
                .populate('ecspeditor')
                .populate('organization')
                .populate('manager')
                .sort(sort)
            if(search.length>0)
                districts = districts.filter(
                    district => (
                        (district.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (district.agent&&district.agent.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (district.ecspeditor && district.ecspeditor.name.toLowerCase().includes(search.toLowerCase())) ||
                        (district.manager && district.manager.name.toLowerCase().includes(search.toLowerCase())) ||
                        ((district.client.filter(client => clients.includes(client.toString()))).length)
                    )
                )
            return districts
        }
        else if(['менеджер'].includes(user.role)){
            let districts =  await DistrictAzyk.find({
                $or: [
                    {manager: user.employment},
                ]

            })
                .populate('agent')
                .populate('ecspeditor')
                .populate('organization')
                .populate('manager')
                .sort(sort)
            if(search.length>0)
                districts = districts.filter(
                    district => (
                        (district.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (district.ecspeditor && district.ecspeditor.name.toLowerCase().includes(search.toLowerCase())) ||
                        (district.agent&&district.agent.name.toLowerCase()).includes(search.toLowerCase()) ||
                        ((district.client.filter(client => clients.includes(client.toString()))).length)
                    )
                )
            return districts
        }
        else if('агент'===user.role){
            let districts =  await DistrictAzyk.find({
                $or: [
                    {agent: user.employment},
                ]

            })
                .populate('agent')
                .populate('ecspeditor')
                .populate('organization')
                .populate('manager')
                .sort(sort)
            return districts
        }
    },
    clientsWithoutDistrict: async(parent, { organization }, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)){
            if(user.organization)
                organization = user.organization
            let clients = await DistrictAzyk
                .find({organization: organization==='super'?null:organization})
                .distinct('client')
            if(organization!=='super')
                organization = await OrganizationAzyk.findOne({_id: organization})
            if(organization==='super'||organization.accessToClient)
                clients = await ClientAzyk
                    .find({_id: { $nin: clients}, del: {$ne: 'deleted'}})
                    .populate({
                        path: 'user',
                        match: {status: 'active'}
                    })
                    .populate({ path: 'organization' })
                    .sort('-name')
            else {
                let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
                clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
                clients = await ClientAzyk
                    .find({
                        _id: { $nin: clients},
                        $or: [{_id: {$in: clients}}, {organization: user.organization}],
                        del: {$ne: 'deleted'}
                    })
                    .populate({
                        path: 'user',
                        match: {status: 'active'}
                    })
                    .populate({path: 'organization'})
                    .sort('-name')
            }
            clients = clients.filter(client => (
                client.user&&
                client.user.status==='active'&&
                client.address[0]&&
                !(client.name.toLowerCase()).includes('агент')&&
                !(client.name.toLowerCase()).includes('agent'))
            )
            return clients

        }
    },
    district: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)&&user.role==='admin'){
            return await DistrictAzyk.findOne({_id: _id})
                .populate('agent')
                .populate({path: 'client', populate: [{path: 'user'}]})
                .populate('ecspeditor')
                .populate('organization')
                .populate('manager')
        }
        else if(['суперорганизация', 'организация'].includes(user.role)){
            return await DistrictAzyk.findOne({_id: _id, organization: user.organization})
                .populate('agent')
                .populate({path: 'client', populate: [{path: 'user'}]})
                .populate('ecspeditor')
                .populate('organization')
                .populate('manager')
        }
        else if(['менеджер'].includes(user.role)){
            return await DistrictAzyk.findOne({_id: _id, manager: user.employment})
                .populate('agent')
                .populate({path: 'client', populate: [{path: 'user'}]})
                .populate('ecspeditor')
                .populate('organization')
                .populate('manager')
        }
        else if(['агент', 'суперагент'].includes(user.role)){
            return await DistrictAzyk.findOne({agent: user.employment})
                .populate('agent')
                .populate({path: 'client', populate: [{path: 'user'}]})
                .populate('ecspeditor')
                .populate('organization')
                .populate('manager')
        }
        else return null
    },
    sortDistrict: async() => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            }
        ]
        return sort
    },
};

const resolversMutation = {
    addDistrict: async(parent, {organization, client, name, agent, ecspeditor, manager}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            let _object = new DistrictAzyk({
                name: name,
                client: client,
                agent: agent,
                ecspeditor: ecspeditor,
                organization: organization!=='super'?organization:undefined,
                manager: manager,
            });
            await DistrictAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setDistrict: async(parent, {_id, client, ecspeditor, name, agent, manager}, {user}) => {
        let object = await DistrictAzyk.findById(_id)
        if(object&&['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)){
            if(name)object.name = name
            if(client){
                let objectAgentRouteAzyk = await AgentRouteAzyk.findOne({district: object._id})
                if(objectAgentRouteAzyk){
                    for(let i=0; i<object.client.length; i++) {
                        if(!client.includes(object.client[i].toString())){
                            for(let i2=0; i2<7; i2++) {
                                let index = objectAgentRouteAzyk.clients[i2].indexOf(object.client[i].toString())
                                if(index!==-1)
                                    objectAgentRouteAzyk.clients[i2].splice(index, 1)
                            }
                            await objectAgentRouteAzyk.save()
                        }
                    }
                }
                object.client = client
            }
            if(agent)object.agent = agent
            if(ecspeditor)object.ecspeditor = ecspeditor
            if(manager)object.manager = manager
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteDistrict: async(parent, { _id }, {user}) => {
        let objects = await DistrictAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'||(['суперорганизация', 'организация'].includes(user.role)&&user.organization.toString()===objects[i].organization.toString())) {
                await DistrictAzyk.deleteMany({_id: objects[i]._id})
                await AgentRouteAzyk.deleteMany({district: objects[i]._id})
                await OutXMLAdsShoroAzyk.deleteMany({district: objects[i]._id})
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