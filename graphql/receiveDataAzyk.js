const ReceivedDataAzyk = require('../models/receivedDataAzyk');

const type = `
  type ReceivedData {
    _id: ID
    createdAt: Date
    organization: Organization
    guid: String
    name: String
    addres: String
    agent: String
    phone: String
    type: String
  }
`;

const query = `
    receivedDatas(search: String!): [ReceivedData]
`;

const mutation = `
    clearAllReceivedDatas: Data
    deleteReceivedData(_ids: [ID]!): Data
`;

const resolvers = {
    receivedDatas: async(parent, {search}, {user}) => {
        if('admin'===user.role){
            return await ReceivedDataAzyk.find(search.length?{
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {addres: {'$regex': search, '$options': 'i'}}
                ]
            }:{}).populate('organization').sort('-createdAt')
        }
    }
};

const resolversMutation = {
    clearAllReceivedDatas: async(parent, ctx, {user}) => {
        if('admin'===user.role){
            await ReceivedDataAzyk.deleteMany()
        }
        return {data: 'OK'}
    },
    deleteReceivedData: async(parent, { _ids }, {user}) => {
        if('admin'===user.role){
            await ReceivedDataAzyk.deleteMany({_id: {$in: _ids}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;