const ReturnedAzyk = require('../models/returnedAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const ClientAzyk = require('../models/clientAzyk');
const randomstring = require('randomstring');
const { setSingleOutXMLReturnedAzyk, cancelSingleOutXMLReturnedAzyk, setSingleOutXMLReturnedAzykLogic } = require('../module/singleOutXMLAzyk');
const { pubsub } = require('./index');
const { withFilter } = require('graphql-subscriptions');
const RELOAD_RETURNED = 'RELOAD_RETURNED';
const HistoryReturnedAzyk = require('../models/historyReturnedAzyk');
const mongoose = require('mongoose');

const type = `
  type ReturnedItems {
    _id: ID
    item: String
    count: Int
    allPrice: Int
    allTonnage: Int
    allSize: Int
    weight: Float
    size: Float
    price: Float
  }
  type Returned {
    _id: ID
    createdAt: Date
    updatedAt: Date
    items: [ReturnedItems]
    client: Client
    allPrice: Int 
    info: String,
    address: [String]
    number: String
    confirmationForwarder: Boolean
    sync: Int
    cancelForwarder: Boolean
    allTonnage: Int
    allSize: Int
    editor: String
    sale: Organization
    provider: Organization
    organization: Organization
    agent: Employment 
    del: String
    district: String
    track: Int
    forwarder: Employment
  }
  type HistoryReturned {
    createdAt: Date
    returned: ID
    editor: String
  }
  type ReloadReturned {
    who: ID
    client: ID
    agent: ID
    organization: ID
    returned: Returned
    type: String
    manager: ID
  }
  input ReturnedItemsInput {
    _id: ID
    item: String
    count: Int
    allPrice: Int
    allTonnage: Int
    allSize: Int
    name: String
    weight: Float
    size: Float
    price: Float
  }
`;

const query = `
    returnedsFromDistrict(organization: ID!, district: ID!, date: String!): [Returned]
    returneds(search: String!, sort: String!, date: String!, skip: Int): [Returned]
    returnedsSimpleStatistic(search: String!, date: String): [String]
    returnedsTrash(search: String!, skip: Int): [Returned]
    returnedsTrashSimpleStatistic(search: String!): [String]
    returnedHistorys(returned: ID!): [HistoryReturned]
    sortReturned: [Sort]
`;

const mutation = `
     setReturnedLogic(track: Int, forwarder: ID, returneds: [ID]!): Data
    addReturned(info: String, address: [[String]], organization: ID!, items: [ReturnedItemsInput], client: ID!): Data
    setReturned(items: [ReturnedItemsInput], returned: ID, confirmationForwarder: Boolean, cancelForwarder: Boolean): Returned
    deleteReturneds(_id: [ID]!): Data
    restoreReturneds(_id: [ID]!): Data
`;

const subscription  = `
    reloadReturned: ReloadReturned
`;

const resolvers = {
    returnedsTrashSimpleStatistic: async(parent, {search}, {user}) => {
        let _organizations;
        let _clients;
        let returneds = [];
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        if(user.role==='admin') {
            returneds =  await ReturnedAzyk.find(
                {
                    del: 'deleted',
                    ...(search.length>0?{
                            $or: [
                                {number: {'$regex': search, '$options': 'i'}},
                                {info: {'$regex': search, '$options': 'i'}},
                                {address: {'$regex': search, '$options': 'i'}},
                                {client: {$in: _clients}},
                                {organization: {$in: _organizations}},
                                {sale: {$in: _organizations}},
                                {provider: {$in: _organizations}},
                            ]
                        }
                        :{})
                }
            )
                .lean()
        }
        return [returneds.length.toString()]
    },
    returnedsTrash: async(parent, {search, skip}, {user}) => {
        let _organizations;
        let _clients;
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        if(user.role==='admin') {
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            del: 'deleted',
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {organization: {$in: _organizations}},
                                        {sale: {$in: _organizations}},
                                        {provider: {$in: _organizations}},
                                    ]
                                }
                                :{})
                        }
                    },
                    { $sort : {'createdAt': -1} },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false,
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ])
            return returneds
        }
    },
    returnedsSimpleStatistic: async(parent, {search, date,}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        let _organizations;
        let _clients;
        let returneds = [];
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        if(user.role==='агент'){
            if(date!=='') {
                let now = new Date()
                now.setDate(now.getDate() + 1)
                now.setHours(3, 0, 0, 0)
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd = new Date(dateEnd.setDate(dateEnd.getDate() - 3))
                }
            }
            else {
                dateEnd = new Date()
                dateEnd.setDate(dateEnd.getDate() + 1)
                dateEnd.setHours(3, 0, 0, 0)
                dateStart = new Date(dateEnd)
                dateStart.setDate(dateStart.getDate() - 3)
            }
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            returneds =  await ReturnedAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    client: {$in: clients},
                    confirmationForwarder: true,
                    $and: [
                        {createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}},
                        {
                            $or: [
                                {organization: user.organization},
                                {sale: user.organization},
                                {provider: user.organization},
                            ],
                        },
                        ...(search.length>0? [{
                            $or: [
                                {number: {'$regex': search, '$options': 'i'}},
                                {info: {'$regex': search, '$options': 'i'}},
                                {address: {'$regex': search, '$options': 'i'}},
                                {client: {$in: _clients}},
                                {organization: {$in: _organizations}},
                                {sale: {$in: _organizations}},
                                {provider: {$in: _organizations}},
                            ]
                        }]:[])
                    ],
                }
            )
                .lean()
        }
        else if(user.role==='менеджер'){
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            returneds =  await ReturnedAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    client: {$in: clients},
                    confirmationForwarder: true,
                    $and: [
                        ...(date === '' ?[]:[{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]),
                        {
                            $or: [
                                {organization: user.organization},
                                {sale: user.organization},
                                {provider: user.organization},
                            ]
                        },
                        ...(search.length>0? [{
                            $or: [
                                {number: {'$regex': search, '$options': 'i'}},
                                {info: {'$regex': search, '$options': 'i'}},
                                {address: {'$regex': search, '$options': 'i'}},
                                {client: {$in: _clients}},
                                {organization: {$in: _organizations}},
                                {sale: {$in: _organizations}},
                                {provider: {$in: _organizations}},
                            ]
                        }]:[])
                    ],
                }
            )
                .lean()
        }
        else if(user.role==='admin') {
            returneds =  await ReturnedAzyk.find({
                del: {$ne: 'deleted'},
                ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                confirmationForwarder: true,
                ...(search.length>0?{
                        $or: [
                            {number: {'$regex': search, '$options': 'i'}},
                            {info: {'$regex': search, '$options': 'i'}},
                            {address: {'$regex': search, '$options': 'i'}},
                            {client: {$in: _clients}},
                            {organization: {$in: _organizations}},
                            {sale: {$in: _organizations}},
                            {provider: {$in: _organizations}},
                        ]
                    }
                    :{})
                }).lean()
        }
        else if(['суперорганизация', 'организация'].includes(user.role)) {
            returneds =  await ReturnedAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    confirmationForwarder: true,
                    $and: [
                        ...(date === '' ?[]:[{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]),
                        {
                            $or: [
                                {organization: user.organization},
                                {sale: user.organization},
                                {provider: user.organization},
                            ],
                        },
                        ...(search.length>0? [{
                            $or: [
                                {number: {'$regex': search, '$options': 'i'}},
                                {info: {'$regex': search, '$options': 'i'}},
                                {address: {'$regex': search, '$options': 'i'}},
                                {client: {$in: _clients}},
                                {organization: {$in: _organizations}},
                                {sale: {$in: _organizations}},
                                {provider: {$in: _organizations}},
                            ]
                        }]:[])
                    ],
                })
                .lean()
        }
        let tonnage = 0;
        let size = 0;
        let price = 0;
        let lengthList = 0;
        for(let i=0; i<returneds.length; i++){
            if(!returneds[i].cancelForwarder) {
                price += returneds[i].allPrice
                if (returneds[i].allSize)
                    size += returneds[i].allSize
                lengthList += 1
                if (returneds[i].allTonnage)
                    tonnage += returneds[i].allTonnage
            }
        }
        return [lengthList.toString(), price.toString(), tonnage.toString(), size.toString()]
    },
    returnedsFromDistrict: async(parent, {organization, district, date}, {user}) =>  {
        let dateStart;
        let dateEnd;
        dateStart = new Date(date)
        dateStart.setHours(3, 0, 0, 0)
        dateEnd = new Date(dateStart)
        dateEnd.setDate(dateEnd.getDate() + 1)
        let _clients = await DistrictAzyk.findOne({
            _id: district
        }).distinct('client');
        if(user.role==='admin') {
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            confirmationForwarder: true,
                            client: {$in: _clients},
                            $or: [
                                {organization: new mongoose.Types.ObjectId(organization)},
                                {sale: new mongoose.Types.ObjectId(organization)},
                                {provider: new mongoose.Types.ObjectId(organization)},
                            ]
                        }
                    },
                    { $sort : {createdAt: -1} },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false,
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ]);
            return returneds
        }
        else if(user.role==='агент'){
            let now = new Date()
            now.setDate(now.getDate() + 1)
            now.setHours(3, 0, 0, 0)
            let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
            if(differenceDates>3) {
                dateStart = new Date()
                dateEnd = new Date(dateStart)
                dateEnd = new Date(dateEnd.setDate(dateEnd.getDate() - 3))
            }
            _clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            confirmationForwarder: true,
                            del: {$ne: 'deleted'},
                            client: {$in: _clients},
                            $or: [
                                {organization: user.organization},
                                {sale: user.organization},
                                {provider: user.organization},
                            ]
                        }
                    },
                    { $sort : {createdAt: -1} },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ])
            return returneds
        }
        else if(user.role==='менеджер'){
            _clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            confirmationForwarder: true,
                            del: {$ne: 'deleted'},
                            client: {$in: _clients},
                            $or: [
                                {organization: user.organization},
                                {sale: user.organization},
                                {provider: user.organization},
                            ]
                        }
                    },
                    { $sort : {createdAt: -1} },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                ])
            return returneds
        }
        else if(['суперорганизация', 'организация'].includes(user.role)) {
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            confirmationForwarder: true,
                            del: {$ne: 'deleted'},
                            client: {$in: _clients},
                            $or: [
                                {organization: user.organization},
                                {sale: user.organization},
                                {provider: user.organization},
                            ]
                        }
                    },
                    { $sort : {createdAt: -1} },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                ])
            return returneds
        }
    },
    returnedHistorys: async(parent, {returned}, {user}) => {
        if(['admin', 'менеджер', 'суперорганизация', 'организация'].includes(user.role)){
            let historyReturneds =  await HistoryReturnedAzyk.find({returned: returned})
            return historyReturneds
        }
    },
    returneds: async(parent, {search, sort, date, skip}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        let _sort = {}
        _sort[sort[0]==='-'?sort.substring(1):sort]=sort[0]==='-'?-1:1
        let _organizations;
        let _clients;
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        if(user.role==='admin') {
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {organization: {$in: _organizations}},
                                        {sale: {$in: _organizations}},
                                        {provider: {$in: _organizations}},
                                    ]
                                }
                                :{})
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false,
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ])
            return returneds
        }
        else if(user.role==='суперагент'){
            if(date!=='') {
                let now = new Date()
                now.setHours(3, 0, 0, 0)
                now.setDate(now.getDate() + 1)
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd = new Date(dateEnd.setDate(dateEnd.getDate() - 3))
                }
            }
            else {
                dateEnd = new Date()
                dateEnd.setHours(3, 0, 0, 0)
                dateEnd.setDate(dateEnd.getDate() + 1)
                dateStart = new Date(dateEnd)
                dateStart = new Date(dateStart.setDate(dateStart.getDate() - 3))
            }
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {organization: {$in: _organizations}},
                                        {sale: {$in: _organizations}},
                                        {provider: {$in: _organizations}},
                                    ]
                                }
                                :{}),
                            client: {$in: clients},
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ])
            return returneds
        }
        else if(user.role==='агент'){
            if(date!=='') {
                let now = new Date()
                now.setDate(now.getDate() + 1)
                now.setHours(3, 0, 0, 0)
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd = new Date(dateEnd.setDate(dateEnd.getDate() - 3))
                }
            }
            else {
                dateEnd = new Date()
                dateEnd.setDate(dateEnd.getDate() + 1)
                dateEnd.setHours(3, 0, 0, 0)
                dateStart = new Date(dateEnd)
                dateStart.setDate(dateStart.getDate() - 3)
            }
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
                            client: {$in: clients},
                            $and: [
                                {createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}},
                                {
                                    $or: [
                                        {organization: user.organization},
                                        {sale: user.organization},
                                        {provider: user.organization},
                                    ],
                                },
                                ...(search.length>0?[
                                    {
                                        $or: [
                                            {number: {'$regex': search, '$options': 'i'}},
                                            {info: {'$regex': search, '$options': 'i'}},
                                            {address: {'$regex': search, '$options': 'i'}},
                                            {client: {$in: _clients}},
                                            {organization: {$in: _organizations}},
                                            {sale: {$in: _organizations}},
                                            {provider: {$in: _organizations}},
                                        ]
                                    }
                                    ]:[])
                            ],
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ])
            return returneds
        }
        else if(user.role==='менеджер'){
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            client: {$in: clients},
                            $and: [
                                ...(date===''?[]:[{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]),
                                {
                                    $or: [
                                        {organization: user.organization},
                                        {sale: user.organization},
                                        {provider: user.organization},
                                    ]
                                },
                                ...(search.length>0?[{
                                        $or: [
                                            {number: {'$regex': search, '$options': 'i'}},
                                            {info: {'$regex': search, '$options': 'i'}},
                                            {address: {'$regex': search, '$options': 'i'}},
                                            {client: {$in: _clients}},
                                            {organization: {$in: _organizations}},
                                            {sale: {$in: _organizations}},
                                            {provider: {$in: _organizations}},
                                        ]
                                    }]
                                    :[{
                                    }]),
                            ]
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                ])
            return returneds
        }
        else if(['суперорганизация', 'организация'].includes(user.role)) {
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            $and: [
                                ...(date===''?[]:[{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]),
                                {
                                    $or: [
                                        {organization: user.organization},
                                        {sale: user.organization},
                                        {provider: user.organization},
                                    ]
                                },
                                ...(search.length>0?[{
                                        $or: [
                                            {number: {'$regex': search, '$options': 'i'}},
                                            {info: {'$regex': search, '$options': 'i'}},
                                            {address: {'$regex': search, '$options': 'i'}},
                                            {client: {$in: _clients}},
                                            {organization: {$in: _organizations}},
                                            {sale: {$in: _organizations}},
                                            {provider: {$in: _organizations}},
                                        ]
                                    }]
                                    :[{
                                    }]),
                            ]
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { sale: '$sale' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$sale', '$_id']}} },
                            ],
                            as: 'sale'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$sale'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { provider: '$provider' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$provider', '$_id']}} },
                            ],
                            as: 'provider'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$provider'
                        }
                    },
                ])
            return returneds
        }
    },
    sortReturned: async() => {
        let sort = [
            {
                name: 'Дата',
                field: 'createdAt'
            },
            {
                name: 'Сумма',
                field: 'allPrice'
            },
            {
                name: 'Кубатура',
                field: 'allTonnage'
            },
            {
                name: 'Тоннаж',
                field: 'allSize'
            }
        ]
        return sort
    },
};

const resolversMutation = {
    addReturned: async(parent, {info, address, organization, client, items}, {user}) =>     {
        let dateStart = new Date()
        if(dateStart.getHours()<3)
            dateStart.setDate(dateStart.getDate() - 1)
        dateStart.setHours(3, 0, 0, 0)
        let dateEnd = new Date(dateStart)
        dateEnd.setDate(dateEnd.getDate() + 1)
        let distributers = await DistributerAzyk.find({
            $or: [
                {sales: organization},
                {provider: organization}
            ]
        }).lean()
        let districtSales = null;
        let districtProvider = null;
        if(distributers.length>0){
            for(let i=0; i<distributers.length; i++){
                let findDistrict = await DistrictAzyk.findOne({
                    organization: distributers[i].distributer,
                    client: client
                })
                if(findDistrict&&distributers[i].sales.toString().includes(organization))
                    districtSales = findDistrict
                if(findDistrict&&distributers[i].provider.toString().includes(organization))
                    districtProvider = findDistrict
            }
        }
        if(!districtSales||!districtProvider) {
            let findDistrict = await DistrictAzyk.findOne({
                organization: organization,
                client: client
            })
                .lean()
            if(!districtSales)
                districtSales = findDistrict
            if(!districtProvider)
                districtProvider = findDistrict
        }
        let objectReturned = await ReturnedAzyk.findOne({
            organization: organization,
            client: client,
            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
            del: {$ne: 'deleted'},
            cancelForwarder: null
        }).sort('-createdAt')
        let allPrice = 0
        let allTonnage = 0
        let allSize = 0
        if(!objectReturned){
            let number = randomstring.generate({length: 12, charset: 'numeric'});
            while (await ReturnedAzyk.findOne({number: number}))
                number = randomstring.generate({length: 12, charset: 'numeric'});
            for(let i = 0; i< items.length; i++){
                allPrice+=items[i].allPrice
                allSize+=items[i].allSize
                allTonnage+=items[i].allTonnage
            }
            objectReturned = new ReturnedAzyk({
                items: items,
                client: client,
                allPrice: allPrice,
                allTonnage: allTonnage,
                allSize: allSize,
                number: number,
                info: info,
                address: address,
                organization: organization,
                district:  districtSales?districtSales.name:null,
                track: 1,
                forwarder: districtProvider?districtProvider.ecspeditor:null,
                sale: districtSales&&districtSales.organization.toString()!==organization.toString()?districtSales.organization:null,
                provider: districtProvider?districtProvider.organization:null
            });
            if(user.employment)
                objectReturned.agent = user.employment
            objectReturned = await ReturnedAzyk.create(objectReturned);
        }
        else{
            for(let i = 0; i< items.length; i++){
                let have = false
                for(let i1=0; i1<objectReturned.items.length; i1++) {
                    if(items[i]._id===objectReturned.items[i1]._id){
                        objectReturned.items[i1].count+=items[i].count
                        objectReturned.items[i1].allPrice+=items[i].allPrice
                        objectReturned.items[i1].allTonnage+=items[i].allTonnage
                        objectReturned.items[i1].allSize+=items[i].allSize
                        have = true
                    }
                }
                if(!have)
                    objectReturned.items.push(items[i])
                objectReturned.allPrice+=items[i].allPrice
                objectReturned.allSize+=items[i].allSize
                objectReturned.allTonnage+=items[i].allTonnage
            }
            await objectReturned.save()
        }
        pubsub.publish(RELOAD_RETURNED, { reloadReturned: {
            who: user.role==='admin'?null:user._id,
            agent: districtSales?districtSales.agent:null,
            client: client,
            organization: organization,
            returned: objectReturned,
            manager: districtSales?districtSales.manager:undefined,
            type: 'ADD'
        } });
        return {data: 'OK'};
    },
    deleteReturneds: async(parent, {_id}, {user}) => {
        if(user.role==='admin'){
            let objects = await ReturnedAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                let findDistrict = await DistrictAzyk.findOne({
                    organization: objects[i].organization,
                    client: objects[i].client
                })
                objects[i].del = 'deleted'
                await objects[i].save()
                pubsub.publish(RELOAD_RETURNED, { reloadReturned: {
                    who: user.role==='admin'?null:user._id,
                    client: objects[i].client,
                    agent: findDistrict?findDistrict.agent:null,
                    organization: objects[i].organization,
                    returned: {_id: objects[i]._id},
                    manager: findDistrict?findDistrict.manager:undefined,
                    type: 'DELETE'
                } });
            }
        }
        return {data: 'OK'};
    },
    restoreReturneds: async(parent, {_id}, {user}) => {
        if(user.role==='admin'){
            await ReturnedAzyk.updateMany({_id: {$in: _id}}, {del: null})
        }
        return {data: 'OK'};
    },
    setReturnedLogic: async(parent, {track, forwarder, returneds}) => {
        await setSingleOutXMLReturnedAzykLogic(returneds, forwarder, track)
        return {data: 'OK'};
    },
    setReturned: async(parent, {items, returned, confirmationForwarder, cancelForwarder}, {user}) => {
        let object = await ReturnedAzyk.findOne({_id: returned})
            .populate({
                path: 'client'
            })
            .populate({path: 'organization'})
            .populate({path: 'sale'})
            .populate({path: 'provider'});
        let district = null;
        let distributers = await DistributerAzyk.find({
            sales: object.organization._id
        })
        if(distributers.length>0){
            for(let i=0; i<distributers.length; i++){
                let findDistrict = await DistrictAzyk.findOne({
                    organization: distributers[i].distributer,
                    client: object.client._id
                })
                if(findDistrict)
                    district = findDistrict
            }
        }
        if(!district) {
            let findDistrict = await DistrictAzyk.findOne({
                organization: object.organization._id,
                client: object.client._id
            })
            if(findDistrict)
                district = findDistrict
        }
        let editor;
        if(items.length>0&&(['менеджер', 'admin', 'агент', 'суперагент', 'суперорганизация', 'организация'].includes(user.role))){
            let allPrice = 0
            let allTonnage = 0
            let allSize = 0
            for(let i=0; i<items.length;i++){
                allPrice += items[i].allPrice
                allTonnage += items[i].allTonnage
                allSize += items[i].allSize
            }

            object.allPrice = Math.round(allPrice)
            object.allTonnage = allTonnage
            object.allSize = allSize
            object.items = items
        }
        if(user.role==='admin'){
            editor = 'админ'
        }
        else if(user.role==='client'){
            editor = `клиент ${object.client.name}`
        }
        else{
            let employment = await EmploymentAzyk.findOne({user: user._id})
            editor = `${user.role} ${employment.name}`
        }
        object.editor = editor
        if(!object.cancelForwarder&&confirmationForwarder!=undefined){
            object.confirmationForwarder = confirmationForwarder
        }
        if(!object.confirmationForwarder&&cancelForwarder!=undefined){
            if(cancelForwarder){
                object.cancelForwarder = true
            }
            else if(!cancelForwarder) {
                object.cancelForwarder = false
            }
        }
        await object.save();

        if(object.organization.pass&&object.organization.pass.length){
            if(object.confirmationForwarder) {
                await setSingleOutXMLReturnedAzyk(object)
            }
            else if(object.cancelForwarder) {
                await cancelSingleOutXMLReturnedAzyk(object)
            }
        }

        let objectHistoryReturned = new HistoryReturnedAzyk({
            returned: returned,
            editor: editor,
        });
        await HistoryReturnedAzyk.create(objectHistoryReturned);
        pubsub.publish(RELOAD_RETURNED, { reloadReturned: {
            who: user.role==='admin'?null:user._id,
            client: object.client._id,
            agent: district?district.agent:null,
            organization: object.organization._id,
            returned: object,
            manager: district?district.manager:undefined,
            type: 'SET'
        } });
        return object
    }
};

const resolversSubscription = {
    reloadReturned: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(RELOAD_RETURNED),
            (payload, variables, {user} ) => {
                return (
                    user._id.toString()!==payload.reloadOrder.who&&
                    (['admin', 'суперагент'].includes(user.role)||
                    (user.employment&&payload.reloadReturned.agent&&payload.reloadReturned.agent.toString()===user.employment.toString())||
                    (user.employment&&payload.reloadReturned.manager&&payload.reloadReturned.manager.toString()===user.employment.toString())||
                    (user.organization&&payload.reloadReturned.organization&&['суперорганизация', 'организация'].includes(user.role)&&payload.reloadReturned.organization.toString()===user.organization.toString()))
                )
            },
        )
    },

}

module.exports.RELOAD_RETURNED = RELOAD_RETURNED;
module.exports.resolversSubscription = resolversSubscription;
module.exports.subscription = subscription;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;