const ReceivedDataAzyk = require('../models/receivedDataAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const ClientAzyk = require('../models/clientAzyk');
const UserAzyk = require('../models/userAzyk');
const randomstring = require('randomstring');

const type = `
  type ReceivedData {
    _id: ID
    createdAt: Date
    organization: Organization
    guid: String
    name: String
    addres: String
    agent: Employment
    phone: String
    type: String
    status: String
    position: String
  }
`;

const query = `
    receivedDatas(search: String!, filter: String!, organization: ID!): [ReceivedData]
    filterReceivedData: [Filter]
`;

const mutation = `
    clearAllReceivedDatas(organization: ID!): Data
    deleteReceivedData(_ids: [ID]!): Data
    addReceivedDataClient(_id: ID!): Data
`;

const resolvers = {
    receivedDatas: async(parent, {search, filter, organization}, {user}) => {
        if('admin'===user.role){
            return await ReceivedDataAzyk.find({
                organization: organization,
                type: {'$regex': filter, '$options': 'i'},
                ...search.length ? {
                    $or: [
                        {name: {'$regex': search, '$options': 'i'}},
                        {addres: {'$regex': search, '$options': 'i'}}
                    ]
                } : {},
            })
                .populate('agent')
                .sort('-createdAt')
        }
    },
    filterReceivedData: async(parent, ctx, {user}) => {
        let filter = [
            {
                name: 'Все',
                value: ''
            },
            {
                name: 'Сотрудники',
                value: 'сотрудник'
            },
            {
                name: 'Клиенты',
                value: 'клиент'
            }
        ]
        if(user.role)
            filter.push()
        return filter
    },
};

const resolversMutation = {
    clearAllReceivedDatas: async(parent, {organization}, {user}) => {
        if('admin'===user.role){
            await ReceivedDataAzyk.deleteMany({organization: organization})
        }
        return {data: 'OK'}
    },
    deleteReceivedData: async(parent, { _ids }, {user}) => {
        if('admin'===user.role){
            await ReceivedDataAzyk.deleteMany({_id: {$in: _ids}})
        }
        return {data: 'OK'}
    },
    addReceivedDataClient: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            let receivedData = await ReceivedDataAzyk.findOne({_id: _id})
            let integrate1CAzyk = await Integrate1CAzyk.findOne({
                organization: receivedData.organization,
                guid: receivedData.guid
            })
            if(!integrate1CAzyk){
                let _client = new UserAzyk({
                    login: randomstring.generate(20),
                    role: 'client',
                    status: 'deactive',
                    password: '12345678',
                });
                _client = await UserAzyk.create(_client);
                _client = new ClientAzyk({
                    name: 'Новый',
                    phone: receivedData.phone,
                    city: 'Бишкек',
                    address: [[receivedData.addres?receivedData.addres:'', '', receivedData.name?receivedData.name:'']],
                    user: _client._id,
                    notification: false
                });
                _client = await ClientAzyk.create(_client);
                let _object = new Integrate1CAzyk({
                    item: null,
                    client: _client._id,
                    agent: null,
                    ecspeditor: null,
                    organization: receivedData.organization,
                    guid: receivedData.guid,
                });
                await Integrate1CAzyk.create(_object)
                let district = await DistrictAzyk.findOne({
                    agent: receivedData.agent
                })
                district.client.push(_client._id)
                await district.save()
                await ReceivedDataAzyk.deleteMany({_id: _id})
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