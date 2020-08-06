const DistributerAzyk = require('../models/distributerAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const mongoose = require('mongoose');

const type = `
  type Distributer {
      _id: ID
      createdAt: Date
      distributer: Organization
      sales: [Organization]
      provider: [Organization]
  }
`;

const query = `
    distributers(sort: String!, search: String!): [Distributer]
    distributer(_id: ID!): Distributer
    organizationsWithoutDistributer(distributer: ID!): [Organization]
`;

const mutation = `
    addDistributer(distributer: ID!, sales: [ID], provider: [ID]): Data
    setDistributer(_id: ID!, sales: [ID], provider: [ID]): Data
    deleteDistributer(_id: [ID]!): Data
`;

const resolvers = {
    distributers: async(parent, {search, sort}, {user}) => {
        if(user.role==='admin'){
            let distributers = await DistributerAzyk.find()
                .populate('distributer')
                .populate('sales')
                .sort(sort)
            distributers = distributers.filter(distributer => (distributer.distributer && distributer.distributer.name.toLowerCase().includes(search.toLowerCase())))
            return distributers
        }
    },
    organizationsWithoutDistributer: async(parent, { distributer }, {user}) => {
        if('admin'===user.role){
            let organizations = await DistributerAzyk
                .findOne({distributer: distributer!=='super'?distributer:null})
                .distinct('sales')
            if(distributer!=='super')
                organizations = [distributer, ...organizations]
            organizations = await OrganizationAzyk
                .find({_id: { $nin: organizations}, del: {$ne: 'deleted'}})
                .sort('-name')
            return organizations

        }
    },
    distributer: async(parent, {_id}, {user}) => {
        if((mongoose.Types.ObjectId.isValid(_id)||_id==='super')){
            if(!['admin', 'суперагент'].includes(user.role)) _id = user.organization
            return await DistributerAzyk.findOne(
                _id!=='super'?
                    {$or:[{_id: _id}, {distributer: _id}]}
                    :
                    {distributer: null}
            )
                .populate('distributer')
                .populate('sales')
                .populate('provider')
        }
        else return null
    },
};

const resolversMutation = {
    addDistributer: async(parent, {distributer, sales, provider}, {user}) => {
        if(['admin'].includes(user.role)){
            let _object = new DistributerAzyk({
                distributer: distributer!=='super'?distributer:null,
                sales: sales,
                provider: provider
            });
            await DistributerAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setDistributer: async(parent, {_id,  sales, provider}, {user}) => {
        let object = await DistributerAzyk.findById(_id)
        if(user.role==='admin') {
            if(sales)object.sales = sales
            if(provider)object.provider = provider
            object.save();
        }
        return {data: 'OK'}
    },
    deleteDistributer: async(parent, { _id }, {user}) => {
        if(user.role==='admin') {
            await DistributerAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;