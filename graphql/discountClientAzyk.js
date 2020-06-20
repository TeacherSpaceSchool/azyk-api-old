const DiscountClient = require('../models/discountClientAzyk');

const type = `
  type DiscountClient {
    _id: ID
    createdAt: Date
    client: ID
    discount: Int
    organization: ID
  }
`;

const query = `
    discountClients(clients: [ID]!, organization: ID!): [DiscountClient]
    discountClient(client: ID!, organization: ID!): DiscountClient
`;

const mutation = `
    setDiscountClients(clients: [ID]!, organization: ID!, discount: Int!): Data
`;

const resolvers = {
    discountClients: async(parent, {clients, organization}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(user.role)) {
            if(user.organization)
                organization = user.organization
            return await DiscountClient.find({client: {$in: clients}, organization: organization==='super'?null:organization}).lean()
        }
    },
    discountClient: async(parent, {client, organization}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin', 'client'].includes(user.role)) {
            if(user.organization)
                organization = user.organization
            return await DiscountClient.findOne({client: client, organization: organization==='super'?null:organization}).lean()
        }
    }
};

const resolversMutation = {
    setDiscountClients: async(parent, {clients, organization, discount}, {user}) => {
        if(['суперорганизация', 'организация', 'менеджер', 'агент', 'admin'].includes(user.role)){
            if(user.organization)
                organization = user.organization
            for(let i=0; i<clients.length; i++){
                let discountClient = await DiscountClient.findOne({client: clients[i], organization: organization==='super'?null:organization});
                if(!discountClient){
                    let _object = new DiscountClient({
                        discount: discount,
                        client: clients[i],
                        organization: organization==='super'?null:organization
                    });
                    await DiscountClient.create(_object)
                }
                else {
                    discountClient.discount = discount;
                    await discountClient.save();
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