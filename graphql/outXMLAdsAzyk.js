const OutXMLAdsShoroAzyk = require('../models/integrate/outXMLAdsShoroAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');


const type = `
  type OutXMLAdsShoro {
    _id: ID
    createdAt: Date
    guid: String
    district: District
  }
`;

const query = `
    outXMLAdsShoros(search: String!): [OutXMLAdsShoro]
    districtsOutXMLAdsShoros: [District]
`;

const mutation = `
    addOutXMLAdsShoro(district: ID!, guid: String!): Data
    setOutXMLAdsShoro(_id: ID!, district: ID, guid: String): Data
    deleteOutXMLAdsShoro(_id: [ID]!): Data
`;

const resolvers = {
    districtsOutXMLAdsShoros: async(parent, ctx, {user}) => {
        if (user.role === 'admin') {
            let organization = await OrganizationAzyk
                .findOne({name: 'ЗАО «ШОРО»'})
            let districts = await OutXMLAdsShoroAzyk.find({})
                .distinct('district')
            districts = await DistrictAzyk.find({
                organization: organization._id,
                _id: {$nin: districts}
            })
            return districts
        }
    },
    outXMLAdsShoros: async(parent, {search}, {user}) => {
        if (user.role === 'admin') {
            let _districts;
            if (search.length > 0) {
                _districts = await DistrictAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
            }
            return await OutXMLAdsShoroAzyk.find({
                ...(
                    search.length > 0 ?
                        {
                            district: {'$in': _districts}
                        }
                        :
                        {}
                )
            })
                .populate('district')
                .sort('-name')
        }
    }
};

const resolversMutation = {
    addOutXMLAdsShoro: async(parent, {district, guid}, {user}) => {
        if(user.role==='admin'){
            let _object = new OutXMLAdsShoroAzyk({
                guid: guid,
                district: district
            });
            await OutXMLAdsShoroAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setOutXMLAdsShoro: async(parent, {_id, district, guid}, {user}) => {
        if(user.role==='admin') {
            let object = await OutXMLAdsShoroAzyk.findById(_id)
            if(district)object.district = district
            if(guid)object.guid = guid
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteOutXMLAdsShoro: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            await OutXMLAdsShoroAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;