const SingleOutXMLAdsAzyk = require('../models/singleOutXMLAdsAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');


const type = `
  type OutXMLAdsShoro {
    _id: ID
    createdAt: Date
    guid: String
    organization: Organization
    district: District
  }
`;

const query = `
    outXMLAdsShoros(organization: ID!, search: String!): [OutXMLAdsShoro]
    districtsOutXMLAdsShoros(organization: ID!): [District]
`;

const mutation = `
    addOutXMLAdsShoro(organization: ID!, district: ID!, guid: String!): Data
    setOutXMLAdsShoro(_id: ID!, district: ID, guid: String): Data
    deleteOutXMLAdsShoro(_id: [ID]!): Data
`;

const resolvers = {
    districtsOutXMLAdsShoros: async(parent, {organization}, {user}) => {
        if (user.role === 'admin') {
            let districts = await SingleOutXMLAdsAzyk.find({})
                .distinct('district')
            districts = await DistrictAzyk.find({
                organization: organization,
                _id: {$nin: districts}
            })
            return districts
        }
    },
    outXMLAdsShoros: async(parent, {organization, search}, {user}) => {
        if (user.role === 'admin') {
            let _districts;
            if (search.length > 0) {
                _districts = await DistrictAzyk.find({
                    name: {'$regex': search, '$options': 'i'}
                }).distinct('_id')
            }
            return await SingleOutXMLAdsAzyk.find({
                organization: organization, ...(search.length > 0?{district: {'$in': _districts}}:{})
            })
                .populate('district')
                .sort('-name')
        }
    }
};

const resolversMutation = {
    addOutXMLAdsShoro: async(parent, {organization, district, guid}, {user}) => {
        organization = await OrganizationAzyk.findOne({_id: organization})
        if(user.role==='admin'&&organization.pass){
            let _object = new SingleOutXMLAdsAzyk({
                guid: guid,
                organization: organization._id,
                pass: organization.pass,
                district: district
            });
            await SingleOutXMLAdsAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setOutXMLAdsShoro: async(parent, {_id, district, guid}, {user}) => {
        if(user.role==='admin') {
            let object = await SingleOutXMLAdsAzyk.findById(_id)
            if(district)object.district = district
            if(guid)object.guid = guid
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteOutXMLAdsShoro: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            await SingleOutXMLAdsAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;