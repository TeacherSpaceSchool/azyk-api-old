const AutoAzyk = require('../models/autoAzyk');

const type = `
  type Auto {
    _id: ID
    number: String
    tonnage: Float
    size: Float
    employment: Employment
    organization: Organization
    createdAt: Date
  }
`;

const query = `
    autos(organization: ID!, search: String!, sort: String!): [Auto]
    auto(_id: ID!): Auto
    autoByEcspeditor(_id: ID!): Auto
    sortAuto: [Sort]
    filterAuto: [Filter]
`;

const mutation = `
    addAuto(number: String!, tonnage: Float!, size: Float!, employment: ID, organization: ID): Auto
    setAuto(_id: ID!, number: String, tonnage: Float, size: Float, employment: ID): Data
    deleteAuto(_id: [ID]!): Data
`;

const resolvers = {
    autos: async(parent, {organization, search, sort}, {user}) => {
        if(user.role==='admin'){
            if(organization==='super'){
                let autos = await AutoAzyk.find({organization: null})
                    .populate('employment')
                    .sort(sort)
                autos = autos.filter(
                    auto => (
                        (auto.number.toLowerCase()).includes(search.toLowerCase()) ||
                        (auto.size.toString().toLowerCase()).includes(search.toLowerCase()) ||
                        (auto.tonnage.toString().toLowerCase()).includes(search.toLowerCase()) ||
                        auto.employment && (auto.employment.name.toLowerCase()).includes(search.toLowerCase())
                    )
                )
                return autos
            }
            else {
                let autos = await AutoAzyk.find({organization: organization})
                    .populate('employment')
                    .populate('organization')
                    .sort(sort)
                autos = autos.filter(
                    auto => (
                        (auto.number.toLowerCase()).includes(search.toLowerCase()) ||
                        (auto.size.toString().toLowerCase()).includes(search.toLowerCase()) ||
                        (auto.tonnage.toString().toLowerCase()).includes(search.toLowerCase()) ||
                        auto.organization && (auto.organization.name.toLowerCase()).includes(search.toLowerCase()) ||
                        auto.employment && (auto.employment.name.toLowerCase()).includes(search.toLowerCase())
                    )
                )
                return autos
            }
        }
        else if(['суперорганизация', 'организация', 'менеджер'].includes(user.role)){
            let autos =  await AutoAzyk.find({organization: organization})
                .populate('employment')
                .populate('organization')
                .sort(sort)
            autos = autos.filter(
                auto => (
                    (auto.number.toLowerCase()).includes(search.toLowerCase()) ||
                    (auto.size.toString().toLowerCase()).includes(search.toLowerCase()) ||
                    (auto.tonnage.toString().toLowerCase()).includes(search.toLowerCase()) ||
                    auto.employment&&(auto.employment.name.toLowerCase()).includes(search.toLowerCase())
                )
            )
            return autos
        }
    },
    auto: async(parent, {_id}, {user}) => {
        let auto = await AutoAzyk.findOne({$or: [{_id: _id}, {employment: _id}]})
            .populate('employment')
            .populate('organization')
        if(user.role==='admin'||user.organization.toString()===auto.organization._id.toString())
            return auto
        else
            return null
    },
    sortAuto: async() => {
        return [
            {
                name: 'Тоннаж',
                field: 'tonnage'
            },
            {
                name: 'Кубатура',
                field: 'size'
            },
        ]
    },
};

const resolversMutation = {
    addAuto: async(parent, {number, tonnage, size, organization, employment}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            let _object = new AutoAzyk({
                number: number,
                tonnage: Math.round(tonnage),
                size: Math.round(size)
            });
            if(employment)_object.employment = employment
            if(user.role==='admin')
                _object.organization = organization==='super'?null:organization
            else
                _object.organization = user.organization
            _object = await AutoAzyk.create(_object)
            return _object
        }
    },
    setAuto: async(parent, {_id, number, tonnage, size, employment}, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)) {
            let object = await AutoAzyk.findById(_id)
            if(number)object.number = number
            if(tonnage)object.tonnage = tonnage
            if(size)object.size = size
            if(employment)object.employment = employment
            object.save();
        }
        return {data: 'OK'}
    },
    deleteAuto: async(parent, { _id }, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            let objects = await AutoAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                if(user.role==='admin'||user.organization.toString()===objects[i].organization.toString())
                    await AutoAzyk.deleteOne({_id: objects[i]._id})
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