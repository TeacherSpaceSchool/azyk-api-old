const { gql, ApolloServer,  } = require('apollo-server-express');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const pubsub = new RedisPubSub();
module.exports.pubsub = pubsub;
const AdsAzyk = require('./adsAzyk');
const DistributerAzyk = require('./distributerAzyk');
const BlogAzyk = require('./blogAzyk');
const CategoryAzyk = require('./categoryAzyk');
const SubCategoryAzyk = require('./subCategoryAzyk');
const ReturnedAzyk = require('./returnedAzyk');
const OrganizationAzyk = require('./organizationAzyk');
const ContactAzyk = require('./contactAzyk');
const FaqAzyk = require('./faqAzyk');
const ClientAzyk = require('./clientAzyk');
const EmploymentAzyk = require('./employmentAzyk');
const AutoAzyk = require('./autoAzyk');
const ItemAzyk = require('./itemAzyk');
const BasketAzyk = require('./basketAzyk');
const OrderAzyk = require('./orderAzyk');
const BonusAzyk = require('./bonusAzyk');
const BonusClientAzyk = require('./bonusClientAzyk');
const EquipmentAzyk = require('./equipmentAzyk');
const PassportAzyk = require('./passport');
const RouteAzyk = require('./routeAzyk');
const NotificationStatisticAzyk = require('./notificationStatisticAzyk');
const StatisticAzyk = require('./statistic');
const SubscriberAzyk = require('./subscriberAzyk');
const AgentRouteAzyk = require('./agentRouteAzyk');
const DistrictAzyk = require('./districtAzyk');
const Integrate1CAzyk = require('./integrate1CAzyk');
const { verifydeuserGQL } = require('../module/passport');
const { GraphQLScalarType } = require('graphql');

const typeDefs = gql`
    scalar Date
    type Data {
       data: String
    }
    type Sort {
        name: String
        field: String
    }
    type Filter {
        name: String
        value: String
    }
    type Social {
        url: String
        image: String
    }
    ${DistrictAzyk.type}
    ${AgentRouteAzyk.type}
    ${DistributerAzyk.type}
    ${Integrate1CAzyk.type}
    ${AdsAzyk.type}
    ${SubscriberAzyk.type}
    ${NotificationStatisticAzyk.type}
    ${FaqAzyk.type}
    ${AutoAzyk.type}
    ${EquipmentAzyk.type}
    ${ClientAzyk.type}
    ${OrganizationAzyk.type}
    ${BlogAzyk.type}
    ${PassportAzyk.type}
    ${CategoryAzyk.type}
    ${SubCategoryAzyk.type}
    ${ReturnedAzyk.type}
    ${EmploymentAzyk.type}
    ${ItemAzyk.type}
    ${ContactAzyk.type}
    ${BasketAzyk.type}
    ${OrderAzyk.type}
    ${RouteAzyk.type}
    ${BonusAzyk.type}
    ${BonusClientAzyk.type}
    ${StatisticAzyk.type}
    type Mutation {
        ${Integrate1CAzyk.mutation}
        ${DistrictAzyk.mutation}
        ${AgentRouteAzyk.mutation}
        ${DistributerAzyk.mutation}
        ${AdsAzyk.mutation}
        ${SubscriberAzyk.mutation}
        ${NotificationStatisticAzyk.mutation}
        ${FaqAzyk.mutation}
        ${AutoAzyk.mutation}
        ${EquipmentAzyk.mutation}
        ${ClientAzyk.mutation}
        ${OrganizationAzyk.mutation}
        ${CategoryAzyk.mutation}
        ${SubCategoryAzyk.mutation}
        ${ReturnedAzyk.mutation}
        ${BlogAzyk.mutation}
        ${PassportAzyk.mutation}
        ${EmploymentAzyk.mutation}
        ${ItemAzyk.mutation}
        ${ContactAzyk.mutation}
        ${BasketAzyk.mutation}
        ${OrderAzyk.mutation}
        ${RouteAzyk.mutation}
        ${BonusAzyk.mutation}
        ${BonusClientAzyk.mutation}
        ${StatisticAzyk.mutation}
    }
    type Query {
        ${Integrate1CAzyk.query}
        ${DistrictAzyk.query}
        ${AgentRouteAzyk.query}
        ${DistributerAzyk.query}
        ${ClientAzyk.query}
        ${FaqAzyk.query}
        ${AutoAzyk.query}
        ${EquipmentAzyk.query}
        ${OrganizationAzyk.query}
        ${AdsAzyk.query}
        ${SubscriberAzyk.query}
        ${NotificationStatisticAzyk.query}
        ${CategoryAzyk.query}
        ${SubCategoryAzyk.query}
        ${ReturnedAzyk.query}
        ${BlogAzyk.query}
        ${PassportAzyk.query}
        ${EmploymentAzyk.query}
        ${ItemAzyk.query}
        ${ContactAzyk.query}
        ${BasketAzyk.query}
        ${OrderAzyk.query}
        ${RouteAzyk.query}
        ${BonusAzyk.query}
        ${BonusClientAzyk.query}
        ${StatisticAzyk.query}
    }
    type Subscription {
        ${OrderAzyk.subscription}
        ${ReturnedAzyk.subscription}
    }
`;

const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return new Date(value).getTime();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value)
            }
            return null;
        },
    }),
    Query: {
        ...Integrate1CAzyk.resolvers,
        ...DistrictAzyk.resolvers,
        ...AgentRouteAzyk.resolvers,
        ...DistributerAzyk.resolvers,
        ...FaqAzyk.resolvers,
        ...AutoAzyk.resolvers,
        ...EquipmentAzyk.resolvers,
        ...ClientAzyk.resolvers,
        ...OrganizationAzyk.resolvers,
        ...BlogAzyk.resolvers,
        ...AdsAzyk.resolvers,
        ...SubscriberAzyk.resolvers,
        ...NotificationStatisticAzyk.resolvers,
        ...PassportAzyk.resolvers,
        ...CategoryAzyk.resolvers,
        ...EmploymentAzyk.resolvers,
        ...SubCategoryAzyk.resolvers,
        ...ReturnedAzyk.resolvers,
        ...ItemAzyk.resolvers,
        ...ContactAzyk.resolvers,
        ...BasketAzyk.resolvers,
        ...OrderAzyk.resolvers,
        ...RouteAzyk.resolvers,
        ...BonusAzyk.resolvers,
        ...BonusClientAzyk.resolvers,
        ...StatisticAzyk.resolvers,
    },
    Mutation: {
        ...Integrate1CAzyk.resolversMutation,
        ...AgentRouteAzyk.resolversMutation,
        ...DistrictAzyk.resolversMutation,
        ...DistributerAzyk.resolversMutation,
        ...FaqAzyk.resolversMutation,
        ...ClientAzyk.resolversMutation,
        ...AutoAzyk.resolversMutation,
        ...EquipmentAzyk.resolversMutation,
        ...OrganizationAzyk.resolversMutation,
        ...CategoryAzyk.resolversMutation,
        ...SubCategoryAzyk.resolversMutation,
        ...ReturnedAzyk.resolversMutation,
        ...BlogAzyk.resolversMutation,
        ...AdsAzyk.resolversMutation,
        ...SubscriberAzyk.resolversMutation,
        ...NotificationStatisticAzyk.resolversMutation,
        ...EmploymentAzyk.resolversMutation,
        ...PassportAzyk.resolversMutation,
        ...ItemAzyk.resolversMutation,
        ...ContactAzyk.resolversMutation,
        ...BasketAzyk.resolversMutation,
        ...OrderAzyk.resolversMutation,
        ...RouteAzyk.resolversMutation,
        ...BonusAzyk.resolversMutation,
        ...BonusClientAzyk.resolversMutation,
        ...StatisticAzyk.resolversMutation,
    },
    Subscription: {
        ...OrderAzyk.resolversSubscription,
        ...ReturnedAzyk.resolversSubscription
    }
};

const run = (app)=>{
    const server = new ApolloServer({
        playground: false,
        typeDefs,
        resolvers,
        subscriptions: {
            keepAlive: 1000,
            onConnect: async (connectionParams) => {
                if (connectionParams.authorization) {
                    let user = await verifydeuserGQL({headers: {authorization: connectionParams.authorization}}, {})
                    return {
                        user: user,
                    }
                }
                throw new Error('Missing auth token!');
            },
            onDisconnect: (webSocket, context) => {
                // ...
            },
        },
        context: async (ctx) => {
            if (ctx.connection) {
                return ctx.connection.context;
            }
            else if(ctx&&ctx.req) {
                let user = await verifydeuserGQL(ctx.req, ctx.res)
                return {req: ctx.req, res: ctx.res, user: user};
            }
        },
        formatError: (err) => {
            console.error(err)
            return err;
        }
    })
    server.applyMiddleware({ app, path : '/graphql', cors: false })
    return server
    //server.listen().then(({ url }) => {console.log(`🚀  Server ready at ${url}`);});
}

module.exports.run = run;
