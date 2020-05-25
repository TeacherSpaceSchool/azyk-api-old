const DeliveryDate = require('../models/deliveryDateAzyk');

const type = `
  type DeliveryDate {
    _id: ID
    createdAt: Date
    client: ID
    days: [Boolean]
    organization: ID
  }
`;

const query = `
    deliveryDates(clients: [ID]!, organization: ID!): [DeliveryDate]
    deliveryDate(client: ID!, organization: ID!): DeliveryDate
`;

const mutation = `
    setDeliveryDates(clients: [ID]!, organization: ID!, days: [Boolean]!): Data
`;

const resolvers = {
    deliveryDates: async(parent, {clients, organization}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(user.role)) {
            if(user.organization)
                organization = user.organization
            return await DeliveryDate.find({client: {$in: clients}, organization: organization==='super'?null:organization}).lean()
        }
    },
    deliveryDate: async(parent, {client, organization}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin', 'client'].includes(user.role)) {
            if(user.organization)
                organization = user.organization
            return await DeliveryDate.findOne({client: client, organization: organization==='super'?null:organization}).lean()
        }
    }
};

const resolversMutation = {
    setDeliveryDates: async(parent, {clients, organization, days}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(user.role)){
            if(user.organization)
                organization = user.organization
            for(let i=0; i<clients.length; i++){
                let deliveryDate = await DeliveryDate.findOne({client: clients[i], organization: organization==='super'?null:organization});
                if(!deliveryDate){
                    let _object = new DeliveryDate({
                        days: days,
                        client: clients[i],
                        organization: organization==='super'?null:organization
                    });
                    await DeliveryDate.create(_object)
                }
                else {
                    deliveryDate.days = days;
                    await deliveryDate.save();
                }
            }

        }
        return {data: 'OK'};
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;