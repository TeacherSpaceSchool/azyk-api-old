const AgentHistoryGeoAzyk = require('../models/agentHistoryGeoAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const UserAzyk = require('../models/userAzyk');
const {getGeoDistance, pdDDMMYYHHMM} = require('../module/const');

const type = `
  type AgentHistoryGeo {
    _id: ID
    createdAt: Date
    geo: String
    client: Client
    agent: Employment
  }
`;

const query = `
    agentHistoryGeos(organization: ID, agent: ID, date: String): Statistic
`;

const mutation = `
    addAgentHistoryGeo(client: ID!, geo: String!): Data
`;

const resolvers = {
    agentHistoryGeos: async(parent, {organization, agent, date}) => {
        let dateStart = date?new Date(date):new Date()
        dateStart.setHours(3, 0, 0, 0)
        let dateEnd = new Date(dateStart)
        dateEnd.setDate(dateEnd.getDate() + 1)
        let data = []
        let agents = []
        if(!agent){
            if(organization!=='super')
                agents = await EmploymentAzyk.find({organization: organization}).distinct('_id')
            else {
                agents = await UserAzyk.find({role: 'суперагент'}).distinct('_id')
                agents = await EmploymentAzyk.find({user: {$in: agents}}).distinct('_id')
             }
        }

        let agentHistoryGeoAzyks = await AgentHistoryGeoAzyk.find({
            //$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
            ...(agent?{agent: agent}:{agent: {$in: agents}})
        })
            .populate('client')
            .populate('agent')
            .sort('-createdAt')
            .lean()
        if(!agent){
            let dataKey = {}
            for(let i=0; i<agentHistoryGeoAzyks.length; i++){
                if (!dataKey[agentHistoryGeoAzyks[i].agent._id])
                    dataKey[agentHistoryGeoAzyks[i].agent._id] = {
                        _id: agentHistoryGeoAzyks[i].agent._id,
                        count: 0,
                        name: agentHistoryGeoAzyks[i].agent.name,
                        cancel: 0,
                        order: 0
                    }
                dataKey[agentHistoryGeoAzyks[i].agent._id].count+=1
                if(await InvoiceAzyk.findOne({
                        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                        client: agentHistoryGeoAzyks[i].client._id,
                        del: {$ne: 'deleted'},
                        taken: true
                    }))
                    dataKey[agentHistoryGeoAzyks[i].agent._id].order+=1
                else
                    dataKey[agentHistoryGeoAzyks[i].agent._id].cancel+=1
            }
            const keys = Object.keys(dataKey)
            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: dataKey[keys[i]]._id,
                    data: [
                        dataKey[keys[i]].name,
                        dataKey[keys[i]].count,
                        dataKey[keys[i]].order,
                        dataKey[keys[i]].cancel,
                    ]
                })
            }
            return {
                columns: ['агент', 'посещений', 'заказов', 'отказов'],
                row: data
            };
        }
        else {
            for(let i=0; i<agentHistoryGeoAzyks.length; i++){

                data.push({
                    _id: agentHistoryGeoAzyks[i]._id,
                    data: [
                        pdDDMMYYHHMM(agentHistoryGeoAzyks[i].createdAt),
                        `${agentHistoryGeoAzyks[i].client.name}${agentHistoryGeoAzyks[i].client.address&&agentHistoryGeoAzyks[i].client.address[0]?` (${agentHistoryGeoAzyks[i].client.address[0][2]?`${agentHistoryGeoAzyks[i].client.address[0][2]}, `:''}${agentHistoryGeoAzyks[i].client.address[0][0]})`:''}`,
                        `${getGeoDistance(...(agentHistoryGeoAzyks[i].geo.split(', ')), ...(agentHistoryGeoAzyks[i].client.address[0][1].split(', ')))} м`,
                        agentHistoryGeoAzyks[i].agent.name,
                        await InvoiceAzyk.findOne({
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            client: agentHistoryGeoAzyks[i].client._id,
                            del: {$ne: 'deleted'},
                            taken: true
                        })
                            .sort('-createdAt')
                            .lean()?'заказ':'отказ'
                    ]
                })
            }
            return {
                columns: ['дата', 'клиент', 'растояние', 'агент', 'статус'],
                row: data
            };
        }
    },
};

const resolversMutation = {
    addAgentHistoryGeo: async(parent, {client, geo}, {user}) => {
        if(['агент', 'суперагент'].includes(user.role)){
            let dateStart = new Date()
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let _object = await AgentHistoryGeoAzyk.findOne({
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                client: client,
                agent: user.employment
            })
            if(!_object) {
                _object = new AgentHistoryGeoAzyk({
                    agent: user.employment,
                    client: client,
                    geo: geo
                })
                await AgentHistoryGeoAzyk.create(_object)
            }
        }
        return {data: 'OK'};
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;