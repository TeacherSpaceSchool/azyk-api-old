const Integrate1CAzyk = require('../models/integrate1CAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const ClientAzyk = require('../models/clientAzyk');
const ItemAzyk = require('../models/itemAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const OrderAzyk = require('../models/orderAzyk');
const mongoose = require('mongoose');
const { saveFile, deleteFile } = require('../module/const');
const readXlsxFile = require('read-excel-file/node');
const path = require('path');
const app = require('../app');

const type = `
  type Integrate1C {
      _id: ID
      createdAt: Date
      guid: String
      organization: Organization
      ecspeditor: Employment
      client: Client
      agent: Employment
      item: Item
  }
`;

const query = `
    integrate1Cs(organization: ID!, search: String!, filter: String!, skip: Int): [Integrate1C]
    integrate1CsSimpleStatistic(organization: ID!, search: String!, filter: String!): [String]
    integrate1C(_id: ID!): Integrate1C
    ecspeditorsIntegrate1C(organization: ID!): [Employment]
    agentsIntegrate1C(organization: ID!): [Employment]
    itemsIntegrate1C(organization: ID!): [Item]
    clientsIntegrate1C(organization: ID!): [Client]
    filterIntegrate1C: [Filter]
`;

const mutation = `
    addIntegrate1C(organization: ID!, item: ID, client: ID, guid: String, agent: ID, ecspeditor: ID): Integrate1C
    setIntegrate1C(_id: ID!, item: ID, client: ID, guid: String, agent: ID, ecspeditor: ID): Integrate1C
    deleteIntegrate1C(_id: [ID]!): Data
    unloadingIntegrate1C(document: Upload!, organization: ID!): Data
`;

const resolvers = {
    integrate1CsSimpleStatistic: async(parent, {search, filter, organization}, {user}) => {
        if(user.role==='admin'){
            let _items;
            let _clients;
            let _employments;
            if(search.length>0){
                _items = await ItemAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
                _clients = await ClientAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
                _employments = await EmploymentAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
            }
            let integrate1Cs =  await Integrate1CAzyk.aggregate(
                [
                    {
                        $match:{
                            organization: new mongoose.Types.ObjectId(organization),
                            ...(
                                filter==='агент'?
                                    {agent: {$ne: null}}
                                    :
                                    filter==='экспедитор'?
                                        {ecspeditor: {$ne: null}}
                                        :
                                        filter==='товар'?
                                            {item: {$ne: null}}
                                            :
                                            filter==='клиент'?
                                                {client: {$ne: null}}
                                                :
                                                filter==='менеджер'?
                                                    {manager: {$ne: null}}
                                                    :
                                                    {}
                            ),
                            ...(search.length>0?{
                                    $or: [
                                        {agent: {$in: _employments}},
                                        {manager: {$in: _employments}},
                                        {client: {$in: _clients}},
                                        {ecspeditor: {$in: _employments}},
                                        {item: {$in: _items}},
                                        {guid: {'$regex': search, '$options': 'i'}}
                                    ]
                                }
                                :{}),
                        }
                    },
                    {
                        $count :  'integrate1CsCount'
                    }
                ])
            return [integrate1Cs[0]?integrate1Cs[0].integrate1CsCount.toString():'0']
        }
    },
    integrate1Cs: async(parent, {search, filter, organization, skip}, {user}) => {
        if(user.role==='admin'){
            let _items;
            let _clients;
            let _employments;
            if(search.length>0){
                _items = await ItemAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
                _clients = await ClientAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
                _employments = await EmploymentAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
            }
            let integrate1Cs =  await Integrate1CAzyk.aggregate(
                [
                    {
                        $match:{
                            organization: new mongoose.Types.ObjectId(organization),
                            ...(
                                filter==='агент'?
                                    {agent: {$ne: null}}
                                    :
                                    filter==='экспедитор'?
                                        {ecspeditor: {$ne: null}}
                                        :
                                        filter==='товар'?
                                            {item: {$ne: null}}
                                            :
                                            filter==='клиент'?
                                                {client: {$ne: null}}
                                                :
                                                filter==='менеджер'?
                                                    {manager: {$ne: null}}
                                                    :
                                                    {}
                            ),
                            ...(search.length>0?{
                                    $or: [
                                        {agent: {$in: _employments}},
                                        {client: {$in: _clients}},
                                        {manager: {$in: _employments}},
                                        {ecspeditor: {$in: _employments}},
                                        {item: {$in: _items}},
                                        {guid: {'$regex': search, '$options': 'i'}}
                                    ]
                                }
                                :{}),
                        }
                    },
                    { $sort : {'createdAt': -1} },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: ItemAzyk.collection.collectionName,
                            let: { item: '$item' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$item', '$_id']}} },
                            ],
                            as: 'item'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$item'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$organization'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { ecspeditor: '$ecspeditor' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$ecspeditor', '$_id']}} },
                            ],
                            as: 'ecspeditor'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$ecspeditor'
                        }
                    },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$agent'
                        }
                    },
                ])
            for(let i=0; i<integrate1Cs.length; i++){
                if(integrate1Cs[i].client) {
                    for(let i1=0; i1<integrate1Cs[i].client.address.length; i1++) {
                        integrate1Cs[i].client.name += ` | ${integrate1Cs[i].client.address[i1][2] ? `${integrate1Cs[i].client.address[i1][2]}, ` : ''}${integrate1Cs[i].client.address[i1][0]}`
                    }
                }
            }
            return integrate1Cs
        }
    },
    integrate1C: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)&&user.role==='admin'){
            return await Integrate1CAzyk
                .findOne({_id: _id})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .populate('item')
        }
        else return null
    },
    ecspeditorsIntegrate1C: async(parent, {organization}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)&&user.role==='admin') {
            let ecspeditors =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    ecspeditor: {$ne: null}
                })
                .distinct('ecspeditor')
            ecspeditors = await EmploymentAzyk.find({
                organization: organization,
                _id: {$nin: ecspeditors},
            })
                .populate({path: 'user', match: {role: 'экспедитор', status: 'active'}})
            ecspeditors = ecspeditors.filter(ecspeditor => (ecspeditor.user))
            return ecspeditors
        }
        else return []
    },
    agentsIntegrate1C: async(parent, {organization}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)&&user.role==='admin') {
            let agents =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    agent: {$ne: null}
                })
                .distinct('agent')
            agents = await EmploymentAzyk.find({
                organization: organization,
                _id: {$nin: agents},
            })
                .populate({path: 'user', match: {role: 'агент', status: 'active'}})
            agents = agents.filter(agent => (agent.user))
            return agents
        }
        else return []
    },
    clientsIntegrate1C: async(parent, {organization}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)&&user.role==='admin') {
            let clients =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    client: {$ne: null}
                })
                .distinct('client')
            organization = await OrganizationAzyk.findOne({_id: organization})
            if(organization.accessToClient)
                clients = await ClientAzyk.find({
                    _id: {$nin: clients},
                    del: {$ne: 'deleted'}
                })
                    .populate({path: 'user', match: {status: 'active'}})
            else {
                let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
                let clients1 = await OrderAzyk.find({item: {$in: items}}).distinct('client')
                clients = await ClientAzyk.find({
                    $or: [
                        {$and: [
                            {_id: {$in: clients1}},
                            {_id: { $nin: clients}}
                        ]},
                        {organization: user.organization}],
                    del: {$ne: 'deleted'}
                }).populate({
                    path: 'user',
                    match: {status: 'active'}
                }).populate({path: 'organization'})
            }
            clients = clients.filter(client => (
                client.user&&
                client.address[0]&&
                !(client.name.toLowerCase()).includes('агент')&&
                !(client.name.toLowerCase()).includes('agent'))
            )
            for(let i=0; i<clients.length; i++){
                for(let i1=0; i1<clients[i].address.length; i1++) {
                    clients[i].name+=` | ${clients[i].address[i1][2]?`${clients[i].address[i1][2]}, `:''}${clients[i].address[i1][0]}`
                }
            }
            return clients
        }
        else return []
    },
    itemsIntegrate1C: async(parent, {organization}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)&&user.role==='admin') {
            let items =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    item: {$ne: null}
                })
                .distinct('item')
            items = await ItemAzyk.find({
                _id: {$nin: items},
                organization: organization,
                del: {$ne: 'deleted'}
            })
            return items
        }
        else return []
    },
    filterIntegrate1C: async(parent, ctx, {user}) => {
        let filter = []
        if(user.role==='admin'){
            filter = [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Агент',
                    value: 'агент'
                },
                {
                    name: 'Экспедитор',
                    value: 'экспедитор'
                },
                {
                    name: 'Товар',
                    value: 'товар'
                },
                {
                    name: 'Клиент',
                    value: 'клиент'
                },
                {
                    name: 'Менеджер',
                    value: 'менеджер'
                },
            ]
            return filter
        }
    },
};

const resolversMutation = {
    addIntegrate1C: async(parent, {organization, item, client, guid, agent, ecspeditor}, {user}) => {
        if(['admin'].includes(user.role)){
            let _object = new Integrate1CAzyk({
                item: item,
                client: client,
                agent: agent,
                ecspeditor: ecspeditor,
                organization: organization,
                guid: guid,
            });
            _object = await Integrate1CAzyk.create(_object)
            return await Integrate1CAzyk
                .findOne({_id: _object._id})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .populate('item')
        }
        return null;
    },
    setIntegrate1C: async(parent, {_id, item, client, guid, agent, ecspeditor}, {user}) => {
        if(user.role==='admin') {
            let object = await Integrate1CAzyk.findById(_id)
            if(guid)object.guid = guid
            object.client = client
            object.agent = agent
            object.item = item
            object.ecspeditor = ecspeditor
            await object.save();
            return await Integrate1CAzyk
                .findOne({_id: object._id})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .populate('item')
        }
        return null
    },
    deleteIntegrate1C: async(parent, { _id }, {user}) => {
        if(user.role==='admin')
            await Integrate1CAzyk.deleteMany({_id: {$in: _id}})
        return {data: 'OK'}
    },
    unloadingIntegrate1C: async(parent, { document, organization }, {user}) => {
        if(user.role==='admin'){
            let {stream, filename} = await document;
            filename = await saveFile(stream, filename);
            let xlsxpath = path.join(app.dirname, 'public', filename);
            let rows = await readXlsxFile(xlsxpath)
            for(let i = 0;i<rows.length;i++){
                if(mongoose.Types.ObjectId.isValid(rows[i][0])) {
                    let client = await ClientAzyk.findOne({_id: rows[i][0]})
                    if (client) {
                        let integrate1CAzyk = await Integrate1CAzyk.findOne({
                            organization: organization,
                            client: client._id
                        })
                        if(integrate1CAzyk) {
                            integrate1CAzyk.guid = rows[i][1]
                            await integrate1CAzyk.save()
                        }
                        else {
                            let _object = new Integrate1CAzyk({
                                item: null,
                                client: client._id,
                                agent: null,
                                ecspeditor: null,
                                organization: organization,
                                guid: rows[i][1],
                            });
                            await Integrate1CAzyk.create(_object)
                        }
                    }
                }
            }
            await deleteFile(filename)
            return({data: 'OK'})
        }
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;