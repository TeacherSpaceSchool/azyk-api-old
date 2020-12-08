const InvoiceAzyk = require('../models/invoiceAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const OrderAzyk = require('../models/orderAzyk');
const ReturnedAzyk = require('../models/returnedAzyk');
const ClientAzyk = require('../models/clientAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const ContactAzyk = require('../models/contactAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const AgentRouteAzyk = require('../models/agentRouteAzyk');
const ItemAzyk = require('../models/itemAzyk');
const UserAzyk = require('../models/userAzyk');
const AdsAzyk = require('../models/adsAzyk');
const {pdDDMMYYYY, statsCollection} = require('../module/const');
const ExcelJS = require('exceljs');
const randomstring = require('randomstring');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const { urlMain, saveFile, deleteFile, weekDay, pdDDMMYYHHMM, pdHHMM, checkFloat } = require('../module/const');
const readXlsxFile = require('read-excel-file/node');
const AgentHistoryGeoAzyk = require('../models/agentHistoryGeoAzyk');
const AutoAzyk = require('../models/autoAzyk');
const mongoose = require('mongoose');

const type = `
    type Statistic {
        columns: [String]
        row: [StatisticData]
    }
    type StatisticData {
        _id: ID
        data: [String]
    }
    type ChartStatistic {
        label: String
        data: [[String]]
    }
    type GeoStatistic {
        client: ID
        address: [String]
        data: [String]
    }
    type ChartStatisticAll {
        all: Float
        chartStatistic: [ChartStatistic]
    }
`;

const query = `
    unloadingInvoices(organization: ID!, forwarder: ID, dateStart: Date!, all: Boolean): Data
    unloadingOrders(filter: String!, organization: ID!, dateStart: Date!): Data
    unloadingClients(organization: ID!): Data
    unloadingEmployments(organization: ID!): Data
    unloadingDistricts(organization: ID!): Data
    unloadingAgentRoutes(organization: ID!): Data
    checkAgentRoute(agentRoute: ID!): Statistic
    unloadingAdsOrders(organization: ID!, dateStart: Date!): Data
    statisticClients(company: String, dateStart: Date, dateType: String, online: Boolean): Statistic
    statisticClientActivity(organization: ID, online: Boolean): Statistic
    statisticItemActivity(organization: ID, online: Boolean): Statistic
    statisticOrganizationActivity(organization: ID, online: Boolean): Statistic
    statisticItem(company: String, dateStart: Date, dateType: String, online: Boolean): Statistic
    statisticAdss(company: String, dateStart: Date, dateType: String, online: Boolean): Statistic
    statisticOrder(company: String, dateStart: Date, dateType: String, online: Boolean): Statistic
    statisticAzykStoreOrder(company: ID, filter: String, dateStart: Date, dateType: String): Statistic
    statisticAzykStoreAgents(company: ID, dateStart: Date, dateType: String, filter: String): Statistic
    statisticAzykStoreAgent(agent: ID!, dateStart: Date, dateType: String): Statistic
    statisticClient(client: ID!, dateStart: Date, dateType: String, online: Boolean): Statistic
    statisticGeoOrder(organization: ID!, dateStart: Date): [[String]]
    statisticDistributer(distributer: ID!, organization: ID, dateStart: Date, dateType: String, type: String): Statistic
    statisticReturned(company: String, dateStart: Date, dateType: String): Statistic
    statisticAgents(company: String, dateStart: Date, dateType: String): Statistic
    statisticAgentsWorkTime(organization: String, date: Date): Statistic
    checkOrder(company: String, today: Date!): Statistic
    statisticOrderChart(company: String, dateStart: Date, dateType: String, type: String, online: Boolean): ChartStatisticAll
    activeItem(organization: ID!): [Item]
    activeOrganization: [Organization]
    superagentOrganization: [Organization]
    statisticClientGeo(search: String, organization: ID, item: ID): [GeoStatistic]
    statisticDevice: Statistic
    statisticStorageSize: Statistic
    checkIntegrateClient(organization: ID, type: String, document: Upload): Statistic
`;

const mutation = `
    uploadingClients(document: Upload!, organization: ID!): Data
    uploadingDistricts(document: Upload!, organization: ID!): Data
    uploadingAgentRoute(document: Upload!, agentRoute: ID!, ): Data
   `;

const resolvers = {
    checkIntegrateClient: async(parent, { organization, type, document }, {user}) => {
        if(user.role==='admin'){
            if(type!=='отличая от 1С') {
                let statistic = [];
                let sortStatistic = {};
                let data = await Integrate1CAzyk.find(
                    {
                        organization: organization,
                        client: {$ne: null},
                    }
                )
                    .select('guid client')
                    .populate({
                        path: 'client',
                        select: '_id address'
                    })
                    .lean()
                for (let i = 0; i < data.length; i++) {
                    if (type === 'повторяющиеся guid') {
                        if(!sortStatistic[data[i].guid])
                            sortStatistic[data[i].guid] = []
                        sortStatistic[data[i].guid].push(data[i])
                    }
                    else if (type === 'повторящиеся клиенты') {
                        if(!sortStatistic[data[i].client._id.toString()])
                            sortStatistic[data[i].client._id.toString()] = []
                        sortStatistic[data[i].client._id.toString()].push(data[i])
                    }
                    else {
                        if (data[i].client.address && data[i].client.address[0] && data[i].client.address[0][2]) {
                            let market = data[i].client.address[0][2].toLowerCase()
                            while (market.includes(' '))
                                market = market.replace(' ', '');
                            while (market.includes('-'))
                                market = market.replace('-', '');
                            if(!sortStatistic[market])
                                sortStatistic[market] = []
                            sortStatistic[market].push(data[i])
                        }
                    }
                }
                const keys = Object.keys(sortStatistic)
                for (let i = 0; i < keys.length; i++) {
                    if(sortStatistic[keys[i]].length>1){
                        for (let i1 = 0; i1 < sortStatistic[keys[i]].length; i1++) {
                            statistic.push({
                                _id: `${i}${i1}`, data: [
                                    sortStatistic[keys[i]][i1].guid,
                                    `${sortStatistic[keys[i]][i1].client.address && sortStatistic[keys[i]][i1].client.address[0] ? `${sortStatistic[keys[i]][i1].client.address[0][2] ? `${sortStatistic[keys[i]][i1].client.address[0][2]}, ` : ''}${sortStatistic[keys[i]][i1].client.address[0][0]}` : ''}`,
                                ]
                            })
                        }
                    }
                }

                if (type === 'повторяющиеся guid') {
                    statistic = statistic.sort(function (a, b) {
                        return a.data[0] - b.data[0]
                    });
                }
                else {
                    statistic = statistic.sort(function (a, b) {
                        return a.data[1] - b.data[1]
                    });
                }

                return {
                    columns: ['GUID', 'клиент'],
                    row: statistic
                };
            }
            else if(document) {
                let {stream, filename} = await document;
                filename = await saveFile(stream, filename);
                let xlsxpath = path.join(app.dirname, 'public', filename)
                let rows = await readXlsxFile(xlsxpath);
                let statistic = [];
                let problem;
                for (let i = 0; i < rows.length; i++) {
                    let integrate1CAzyk = await Integrate1CAzyk.findOne({
                        organization: organization,
                        guid: rows[i][0]
                    })
                        .select('guid client')
                        .populate({
                            path: 'client'
                        })
                        .lean()
                    if(integrate1CAzyk&&integrate1CAzyk.client.address[0]&&integrate1CAzyk.client.address[0][2]) {
                        let market = rows[i][1].toString().toLowerCase()
                        while (market.includes(' '))
                            market = market.replace(' ', '')
                        while (market.includes('-'))
                            market = market.replace('-', '')
                        let market1 = integrate1CAzyk.client.address[0][2].toLowerCase()
                        while (market1.includes(' '))
                            market1 = market1.replace(' ', '')
                        while (market1.includes('-'))
                            market1 = market1.replace('-', '')
                        problem = market!==market1
                        if (problem) {
                            statistic.push({
                                _id: i, data: [
                                    integrate1CAzyk.guid,
                                    //integrate1CAzyk.client.address[0][2],
                                    `${integrate1CAzyk.client.address && integrate1CAzyk.client.address[0] ? `${integrate1CAzyk.client.address[0][2] ? `${integrate1CAzyk.client.address[0][2]}, ` : ''}${integrate1CAzyk.client.address[0][0]}` : ''}`,
                                    rows[i][1]
                                ]
                            })
                        }
                    }
                }
                await deleteFile(filename)
                return {
                    columns: ['GUID', 'AZYK.STORE', '1C'],
                    row: statistic
                };

            }
        }
    },
    checkAgentRoute: async(parent, { agentRoute }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            let problem = []
            let data = await AgentRouteAzyk.findOne(
                {
                    _id: agentRoute
                }
            )
                .select('clients district')
                .populate({
                    path: 'district',
                    select: 'client',
                    populate: [{
                        path: 'client',
                        select: '_id user name address',
                        populate: [{
                            path: 'user',
                            select: 'status',
                        }]
                    }]
                })
                .lean()
            for(let i=0; i<data.district.client.length; i++) {
                if(
                    data.district.client[i].user.status==='active'&&(
                        !data.clients[0].toString().includes(data.district.client[i]._id)&&
                        !data.clients[1].toString().includes(data.district.client[i]._id)&&
                        !data.clients[2].toString().includes(data.district.client[i]._id)&&
                        !data.clients[3].toString().includes(data.district.client[i]._id)&&
                        !data.clients[4].toString().includes(data.district.client[i]._id)&&
                        !data.clients[5].toString().includes(data.district.client[i]._id)&&
                        !data.clients[6].toString().includes(data.district.client[i]._id)
                    )
                ){
                    problem.push(
                        {
                            _id: data.district.client[i]._id,
                            data: [
                                data.district.client[i].name,
                                data.district.client[i].address[0][2],
                                data.district.client[i].address[0][0]
                            ]
                        })
                }
            }
            return {
                columns: ['клиент', 'магазин', 'адресс'],
                row: problem
            };
        }
    },
    checkOrder: async(parent, { company, today }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            company = user.organization?user.organization:company
            let tomorrow = new Date(today)
            tomorrow.setHours(3, 0, 0, 0)
            tomorrow.setDate(tomorrow.getDate() + 1)
            let yesterday = new Date(today)
            yesterday.setHours(3, 0, 0, 0)
            yesterday.setDate(yesterday.getDate() - 1)
            let statistic = []
            let problem = ''
            let repeat = 0
            let noSync = 0
                let data = await InvoiceAzyk.find(
                {
                    $and: [
                        {createdAt: {$gte: yesterday}},
                        {createdAt: {$lt: tomorrow}}
                    ],
                    ...(company?{organization: company}:{}),
                    taken: true,
                    del: {$ne: 'deleted'}
                }
            )
                .select('client organization createdAt number sync')
                .populate({
                    path: 'client',
                    select: '_id name address'
                })
                .populate({
                    path: 'organization',
                    select: '_id name'
                })
                .lean()
            for(let i=0; i<data.length; i++) {
                problem = (
                    data.filter(element => element.client._id.toString()===data[i].client._id.toString()&&element.organization._id.toString()===data[i].organization._id.toString())
                ).length>1
                if(problem||data[i].sync!==2) {
                    if(problem)repeat+=1
                    if(data[i].sync!==2)noSync+=1
                    statistic.push({_id: i, data: [
                        data[i].number,
                        `${data[i].client.name}${data[i].client.address&&data[i].client.address[0]?` (${data[i].client.address[0][2]?`${data[i].client.address[0][2]}, `:''}${data[i].client.address[0][0]})`:''}`,
                        data[i].organization.name,
                        pdDDMMYYHHMM(data[i].createdAt),
                        `${problem ? 'повторяющийся' : ''}${problem&&data[i].sync !== 2?', ':''}${data[i].sync !== 2 ? 'несинхронизирован' : ''}`
                    ]})
                }
            }
            statistic = [
                {
                    _id: 'All',
                    data: [
                        repeat,
                        noSync
                    ]
                },
                ...statistic
            ]
            return {
                columns: ['№заказа', 'клиент', 'компания', 'дата', 'проблема'],
                row: statistic
            };
        }
    },
    statisticOrderChart: async(parent, { company, dateStart, dateType, type, online }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            company = user.organization?user.organization:company
            let result = []
            let dateEnd
            let profit=0
            let profitAll=0
            let excludedAgents = []
            let clients = {}
            if(online){
                excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                excludedAgents = await EmploymentAzyk.find({user: {$in: excludedAgents}}).distinct('_id').lean()
            }
            if(dateStart){
                let organizations
                if(!company){
                    organizations = await OrganizationAzyk.find()
                        .select('_id name')
                        .lean()
                }
                else {
                    organizations = await OrganizationAzyk.find({_id: company})
                        .select('_id name')
                        .lean()
                }
                dateStart = new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                if(dateType==='time') {
                    for(let x=0; x<8; x++){
                        dateEnd = new Date(dateStart)
                        dateEnd.setHours(dateStart.getHours() + 3)
                        for (let i = 0; i < organizations.length; i++) {
                            if (!result[i])
                                result[i] = {
                                    label: organizations[i].name,
                                    data: []
                                }
                            let data = await InvoiceAzyk.find(
                                {
                                    $and: [
                                        {createdAt: {$gte: dateStart}},
                                        {createdAt: {$lt: dateEnd}}
                                    ],
                                    del: {$ne: 'deleted'},
                                    taken: true,
                                    organization: organizations[i]._id,
                                    agent: {$nin: excludedAgents}
                                }
                            )
                                .select('allPrice returnedPrice client')
                                .lean()
                            profit = 0
                            clients={}
                            if(type=='money') {
                                for (let i1 = 0; i1 < data.length; i1++) {
                                    profit += data[i1].allPrice - data[i1].returnedPrice
                                }
                            }
                            else if(type=='clients') {
                                for (let i1 = 0; i1 < data.length; i1++) {
                                    if(!clients[data[i1].client.toString()])
                                        clients[data[i1].client.toString()] = 1
                                }
                                profit = Object.keys(clients).length
                            }
                            else
                                profit = data.length
                            profitAll+=profit
                            result[i].data.push([`${dateStart.getHours()<10?'0':''}${dateStart.getHours()}-${dateEnd.getHours()<10?'0':''}${dateEnd.getHours()}`, profit])
                        }
                        dateStart = dateEnd
                    }
                }
                else if(dateType==='day') {
                    let today = new Date();
                    let month;
                    if(today.getDate()===dateStart.getDate()&&today.getMonth()===dateStart.getMonth()&&today.getFullYear()===dateStart.getFullYear()){
                        month = 31;
                        dateStart.setDate(dateStart.getDate()-30)
                    }
                    else {
                        dateStart.setMonth(dateStart.getMonth()+1)
                        dateStart.setDate(0)
                        month = dateStart.getDate();
                        dateStart.setDate(1)
                    }
                    for(let x=0; x<month; x++){
                        dateEnd = new Date(dateStart)
                        dateEnd.setDate(dateEnd.getDate() + 1)
                        for (let i = 0; i < organizations.length; i++) {
                            if (!result[i])
                                result[i] = {
                                    label: organizations[i].name,
                                    data: []
                                }
                            let data = await InvoiceAzyk.find(
                                {
                                    $and: [
                                        {createdAt: {$gte: dateStart}},
                                        {createdAt: {$lt: dateEnd}}
                                    ],
                                    del: {$ne: 'deleted'},
                                    taken: true,
                                    organization: organizations[i]._id,
                                    agent: {$nin: excludedAgents}
                                }
                            )
                                .select('allPrice returnedPrice client')
                                .lean()
                            profit = 0
                            clients={}
                            if(type=='money') {
                                for (let i1 = 0; i1 < data.length; i1++) {
                                    profit += data[i1].allPrice - data[i1].returnedPrice
                                }
                            }
                            else if(type=='clients') {
                                for (let i1 = 0; i1 < data.length; i1++) {
                                    if(!clients[data[i1].client.toString()])
                                        clients[data[i1].client.toString()] = 1
                                }
                                profit = Object.keys(clients).length
                            }
                            else
                                profit = data.length
                            profitAll+=profit
                            result[i].data.push([`${weekDay[dateStart.getDay()]}${dateStart.getDate()<10?'0':''}${dateStart.getDate()}.${dateStart.getMonth()<9?'0':''}${dateStart.getMonth()+1}`, profit])
                        }
                        dateStart = dateEnd
                    }
                }
                else if(dateType==='month') {
                    dateStart.setDate(1)
                    for(let i=0; i<12; i++) {
                        dateStart.setMonth(i)
                        dateEnd = new Date(dateStart)
                        dateEnd.setMonth(i+1)
                        for (let i1 = 0; i1 < organizations.length; i1++) {
                            if (!result[i1])
                                result[i1] = {
                                    label: organizations[i1].name,
                                    data: []
                                }
                            let data = await InvoiceAzyk.find(
                                {
                                    $and: [
                                        {createdAt: {$gte: dateStart}},
                                        {createdAt: {$lt: dateEnd}}
                                    ],
                                    del: {$ne: 'deleted'},
                                    taken: true,
                                    organization: organizations[i1]._id,
                                    agent: {$nin: excludedAgents}
                                }
                            )
                                .select('allPrice returnedPrice client')
                                .lean()
                            profit = 0
                            clients={}
                            if(type=='money') {
                                for (let i2 = 0; i2 < data.length; i2++) {
                                    profit += data[i2].allPrice - data[i2].returnedPrice
                                }
                            }
                            else if(type=='clients') {
                                for (let i1 = 0; i1 < data.length; i1++) {
                                    if(!clients[data[i1].client.toString()])
                                        clients[data[i1].client.toString()] = 1
                                }
                                profit = Object.keys(clients).length
                            }
                            else
                                profit = data.length
                            profitAll+=profit
                            result[i1].data.push([dateStart.getMonth()+1, profit])
                        }
                    }
                }
                else if(dateType==='year') {
                    dateStart.setDate(1)
                    dateStart.setMonth(0)
                    for(let i=2020; i<2050; i++) {
                        dateStart.setYear(i)
                        dateEnd = new Date(dateStart)
                        dateEnd.setYear(i+1)
                        for (let i1 = 0; i1 < organizations.length; i1++) {
                            if (!result[i1])
                                result[i1] = {
                                    label: organizations[i1].name,
                                    data: []
                                }
                            let data = await InvoiceAzyk.find(
                                {
                                    $and: [
                                        {createdAt: {$gte: dateStart}},
                                        {createdAt: {$lt: dateEnd}}
                                    ],
                                    del: {$ne: 'deleted'},
                                    taken: true,
                                    organization: organizations[i1]._id,
                                    agent: {$nin: excludedAgents}
                                }
                            )
                                .select('allPrice returnedPrice')
                                .lean()
                            profit = 0
                            if(type=='money') {
                                for (let i2 = 0; i2 < data.length; i2++) {
                                    profit += data[i2].allPrice - data[i2].returnedPrice
                                }
                            }
                            else
                                profit = data.length
                            profitAll+=profit
                            result[i1].data.push([dateStart.getFullYear(), profit])
                        }
                    }
                }
            }
            return {
                all: profitAll,
                chartStatistic: result
            };
        }
    },
    statisticClientActivity: async(parent, { online, organization } , {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            //console.time('get BD')
            organization = user.organization?user.organization:organization
            let now = new Date()
            /*now.setDate(now.getDate() + 1)
            now.setHours(3, 0, 0, 0)*/

            let noActive = 0;
            let todayActive = 0;
            let weekActive = 0;
            let monthActive = 0;
            let allActive = 0;
            let lastActive;

            let noOrder = 0;
            let todayOrder = 0;
            let weekOrder = 0;
            let monthOrder = 0;
            let allOrder = 0;
            let lastOrder;

            let excludedAgents = []
            if(online){
                excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                excludedAgents = await EmploymentAzyk.find({
                    user: {$in: excludedAgents},
                    ...(organization?{organization: organization}:{})
                }).distinct('_id').lean()
            }
            let statistic = {}
            let orderClient = []
            let orderByClient = {}
            let data =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match:{
                            agent: {$nin: excludedAgents},
                            taken: true,
                            del: {$ne: 'deleted'},
                            ...(organization?{organization: organization}:{})
                        }
                    },
                    { $project : { createdAt : 1, client: 1 }},
                    { $sort : {client: 1, createdAt: 1} },
                    {
                        $group:
                            {
                                _id: '$client',
                                createdAt: { $last: '$createdAt' }
                            }
                    }
                ])

            for(let i=0; i<data.length; i++) {
                if(!orderClient.includes(data[i]._id.toString()))
                    orderClient.push(data[i]._id.toString())
                if(!orderByClient[data[i]._id.toString()])
                    orderByClient[data[i]._id.toString()] = data[i]
            }
            data = await ClientAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    $or: [
                        {lastActive: {$ne: null}},
                        {_id: {$in: orderClient}}
                    ]
                }
            )
                .select('address _id name lastActive')
                .lean()
            for(let i=0; i<data.length; i++) {
                if (data[i].address[0]&&data[i].address[0][1]&&data[i].address[0][1].length>0&&!(data[i].name.toLowerCase()).includes('агент')&&!(data[i].name.toLowerCase()).includes('agent')) {
                    let invoice = orderByClient[data[i]._id.toString()]
                    lastActive = data[i].lastActive?parseInt((now - new Date(data[i].lastActive)) / (1000 * 60 * 60 * 24)):9999
                    lastOrder = invoice?parseInt((now - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24)):9999
                    if(lastActive===9999)
                        noActive+=1
                    else {
                        if(lastActive===0)
                            todayActive+=1
                        if (lastActive < 7)
                            weekActive += 1
                        if (lastActive < 30)
                            monthActive += 1
                        allActive += 1
                    }
                    if(lastOrder===9999)
                        noOrder+=1
                    else {
                        if(lastOrder===0)
                            todayOrder+=1
                        if(lastOrder<7)
                            weekOrder += 1
                        if (lastOrder < 30)
                            monthOrder += 1
                        allOrder += 1
                    }
                    statistic[data[i]._id] = {
                        lastOrder: lastOrder,
                        lastActive: lastActive,
                        client: `${data[i].name}${data[i].address&&data[i].address[0]?` (${data[i].address[0][2]?`${data[i].address[0][2]}, `:''}${data[i].address[0][0]})`:''}`
                    }
                }
            }
            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].client,
                        statistic[keys[i]].lastActive,
                        statistic[keys[i]].lastOrder,
                    ]
                })
            }
            data = data.sort(function(a, b) {
                return a.data[1] - b.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        noActive,
                        noOrder,
                        allActive,
                        allOrder,
                        todayActive,
                        todayOrder,
                        weekActive,
                        weekOrder,
                        monthActive,
                        monthOrder,
                    ]
                },
                ...data
            ]
            //console.timeEnd('get BD')
            return {
                columns: ['клиент', 'активность', 'заказ'],
                row: data
            };
        }
    },
    statisticItemActivity: async(parent, { online, organization } , {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let dateEnd = new Date()
            dateEnd.setDate(dateEnd.getDate() + 1)
            dateEnd.setHours(3, 0, 0, 0)
            let dateStart = new Date(dateEnd)
            dateStart.setDate(dateStart.getDate() - 7)
            let excludedAgents = []
            let statistic = {}
            let allClients=[]
            let allOrders=[]
            let allProfit = 0
            let allReturned = 0
            if(online){
                excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                excludedAgents = await EmploymentAzyk.find({
                    user: {$in: excludedAgents},
                    ...(organization?{organization: organization}:{})
                }).distinct('_id').lean()
            }
            let data = await InvoiceAzyk.find(
                {
                    $and: [
                        dateStart?{createdAt: {$gte: dateStart}}:{},
                        dateEnd?{createdAt: {$lt: dateEnd}}:{}
                    ],
                    ...(organization?{organization: organization}:{}),
                    del: {$ne: 'deleted'},
                    taken: true,
                    agent: {$nin: excludedAgents},
                }
            )
                .select('orders _id client')
                .populate({
                    path: 'orders',
                    select: 'item createdAt _id allPrice count returned',
                    populate : [
                        {
                            path : 'item',
                            select: 'name createdAt _id',
                        }
                    ]
                })
                .lean()
            for(let i=0; i<data.length; i++) {
                for(let ii=0; ii<data[i].orders.length; ii++) {
                    data[i].orders[ii].invoice = data[i]._id
                    data[i].orders[ii].client = data[i].client
                }
            }
            data = data.reduce((acc, val) => acc.concat(val.orders), []);
            for(let i=0; i<data.length; i++) {
                if (!statistic[data[i].item._id]) statistic[data[i].item._id] = {
                    client: [],
                    invoice: [],
                    item: data[i].item.name,
                    profit: 0,
                    returned: 0,
                    consigment: 0
                }
                statistic[data[i].item._id].profit += data[i].allPrice - (data[i].allPrice/data[i].count*data[i].returned)
                allProfit += data[i].allPrice - (data[i].allPrice/data[i].count*data[i].returned)
                statistic[data[i].item._id].returned += data[i].allPrice/data[i].count*data[i].returned
                allReturned += data[i].allPrice/data[i].count*data[i].returned

                if (data[i].count!==data[i].returned&&!allClients.includes(data[i].client.toString())) {
                    allClients.push(data[i].client.toString())
                }
                if (data[i].count!==data[i].returned&&!allOrders.includes(data[i].invoice.toString())) {
                    allOrders.push(data[i].invoice.toString())
                }

                if (data[i].count!==data[i].returned&&!statistic[data[i].item._id].client.includes(data[i].client.toString())) {
                    statistic[data[i].item._id].client.push(data[i].client.toString())
                }
                if (data[i].count!==data[i].returned&&!statistic[data[i].item._id].invoice.includes(data[i].invoice.toString())) {
                    statistic[data[i].item._id].invoice.push(data[i].invoice.toString())
                }

            }
            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].item,
                        statistic[keys[i]].client.length,
                        statistic[keys[i]].invoice.length,
                        checkFloat(statistic[keys[i]].profit),
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].profit/statistic[keys[i]].invoice.length),
                        checkFloat(statistic[keys[i]].profit*100/allProfit)
                    ]
                })
            }

            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'Всего',
                    data: [
                        allClients.length,
                        allOrders.length,
                        checkFloat(allProfit),
                        checkFloat(allReturned),
                    ]
                },
                ...data
            ]
            return {
                columns: ['товар', 'клиентов(шт)', 'заказов(шт)', 'выручка(сом)', 'отказов(сом)', 'средний чек(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticStorageSize: async(parent, ctx, {user}) => {
        if(['admin'].includes(user.role)){
            let allSize = 0
            let allCount = 0
            let mbSize = 1048576
            let size = 0
            let stats
            let data = []
            let collections = [
                {name: 'Маршрут агента', collection: '../models/agentRouteAzyk'},
                {name: 'Акции', collection: '../models/adsAzyk'},
                {name: 'История посещения агентов',collection: '../models/agentHistoryGeoAzyk'},
                {name: 'Маршрут агента', collection: '../models/agentRouteAzyk'},
                {name: 'Транспорт', collection: '../models/autoAzyk'},
                {name: 'Корзина', collection: '../models/basketAzyk'},
                {name: 'Блог', collection: '../models/blogAzyk'},
                {name: 'Бонус', collection: '../models/bonusAzyk'},
                {name: 'Бонус клиента', collection: '../models/bonusClientAzyk'},
                {name: 'Категории', collection: '../models/categoryAzyk'},
                {name: 'Клиенты', collection: '../models/clientAzyk'},
                {name: 'Контакты', collection: '../models/contactAzyk'},
                {name: 'Дни доставки', collection: '../models/deliveryDateAzyk'},
                {name: 'Скидка', collection: '../models/discountClientAzyk'},
                {name: 'Дистрибьютор', collection: '../models/distributerAzyk'},
                {name: 'Районы', collection: '../models/districtAzyk'},
                {name: 'Сотрудники', collection: '../models/employmentAzyk'},
                {name: 'Инвентарь', collection: '../models/equipmentAzyk'},
                {name: 'Ошибка', collection: '../models/errorAzyk'},
                {name: 'FAQ', collection: '../models/faqAzyk'},
                {name: 'История заказов', collection: '../models/historyOrderAzyk'},
                {name: 'История возратов', collection: '../models/historyReturnedAzyk'},
                {name: 'Интеграция 1С', collection: '../models/integrate1CAzyk'},
                {name: 'Накладные', collection: '../models/invoiceAzyk'},
                {name: 'Товары', collection: '../models/itemAzyk'},
                {name: 'Уведомления', collection: '../models/notificationStatisticAzyk'},
                {name: 'Заказы', collection: '../models/orderAzyk'},
                {name: 'Организации', collection: '../models/organizationAzyk'},
                {name: 'Принятая интеграция', collection: '../models/receivedDataAzyk'},
                {name: 'Возвраты', collection: '../models/returnedAzyk'},
                {name: 'Отзывы', collection: '../models/reviewAzyk'},
                {name: 'Маршруты', collection: '../models/routeAzyk'},
                {name: 'Акционая интеграция', collection: '../models/singleOutXMLAdsAzyk'},
                {name: 'Выгрузка заказов', collection: '../models/singleOutXMLAzyk'},
                {name: 'Выгрузка вощвратов', collection: '../models/singleOutXMLReturnedAzyk'},
                {name: 'Подкатегории', collection: '../models/subCategoryAzyk'},
                {name: 'Подписчики', collection: '../models/subscriberAzyk'},
                {name: 'Пользователи', collection: '../models/userAzyk'},
                {name: 'Лотереи', collection: '../models/lotteryAzyk'}
            ]
            for(let i=0; i<collections.length; i++){
                stats = await statsCollection(collections[i].collection)
                size = checkFloat(stats.storageSize/mbSize)
                allSize += size
                allCount += stats.count
                data.push(
                    {_id: `#${i}`, data: [collections[i].name, size, stats.count]}
                )
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'Всего',
                    data: [
                        checkFloat(allSize),
                        allCount
                    ]
                },
                ...data
            ]
            return {
                columns: ['коллекция', 'размер(MB)', 'количество(шт)'],
                row: data
            };
        }
    },
    statisticOrganizationActivity: async(parent, { online, organization } , {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let dateEnd = new Date()
            dateEnd.setDate(dateEnd.getDate() + 1)
            dateEnd.setHours(3, 0, 0, 0)
            let dateStart = new Date(dateEnd)
            dateStart.setDate(dateStart.getDate() - 7)
            let excludedAgents = []
            let data = []
            let districts
            let allClients=[]
            let allOrders=0
            let allProfit = 0
            let allReturned = 0
            let allConsignment = 0
            let statistic = {}
            if(online){
                excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                excludedAgents = await EmploymentAzyk.find({
                    user: {$in: excludedAgents},
                    ...(organization?{organization: organization}:{})
                }).distinct('_id').lean()
            }
            if(!organization){
                data = await InvoiceAzyk.find(
                    {
                        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                        agent: {$nin: excludedAgents},
                        del: {$ne: 'deleted'},
                        taken: true
                    }
                )
                    .select('client allPrice returnedPrice organization consignmentPrice paymentConsignation')
                    .populate({
                        path: 'organization',
                        select: 'name _id'
                    })
                    .lean()
                for(let i=0; i<data.length; i++) {
                    if (!statistic[data[i].organization._id])
                        statistic[data[i].organization._id] = {
                            name: data[i].organization.name,
                            client: [],
                            invoice: 0,
                            profit: 0,
                            consignmentPrice: 0,
                            returned: 0
                        }
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[data[i].organization._id].invoice += 1
                        allOrders += 1
                    }
                    if(!statistic[data[i].organization._id].client.includes(data[i].client.toString())) {
                        statistic[data[i].organization._id].client.push(data[i].client.toString())
                    }
                    if(!allClients.includes(data[i].client.toString())) {
                        allClients.push(data[i].client.toString())
                    }
                    statistic[data[i].organization._id].profit += data[i].allPrice - data[i].returnedPrice
                    allProfit += data[i].allPrice - data[i].returnedPrice
                    statistic[data[i].organization._id].returned += data[i].returnedPrice
                    allReturned += data[i].returnedPrice

                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[data[i].organization._id].consignmentPrice += data[i].consignmentPrice
                        allConsignment += data[i].consignmentPrice
                    }
                }
            }
            else {
                data = await DistrictAzyk.find({organization: organization})
                    .select('client _id name')
                    .lean()
                for(let i=0; i<data.length; i++) {
                    for(let i1=0; i1<data[i].client.length; i1++) {
                        districts[data[i].client[i1].toString()] = data[i]
                    }
                }
                data = await InvoiceAzyk.find(
                    {
                        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                        organization: organization,
                        agent: {$nin: excludedAgents},
                        taken: true
                    }
                )
                    .select('client allPrice returnedPrice consignmentPrice paymentConsignation')
                    .lean()
                for(let i=0; i<data.length; i++) {
                    let district = {_id: 'Прочие', name: 'Прочие'}
                    if(districts[data[i].client.toString()]) {
                        district = districts[data[i].client.toString()]
                    }
                    if (!statistic[district._id])
                        statistic[district._id] = {
                            name: district.name,
                            client: [],
                            invoice: 0,
                            profit: 0,
                            consignmentPrice: 0,
                            returned: 0
                        }
                    if(data[i].allPrice!==data[i].returnedPrice){
                        statistic[district._id].invoice += 1
                        allOrders += 1
                    }
                    if(!statistic[district._id].client.includes(data[i].client.toString())) {
                        statistic[district._id].client.push(data[i].client.toString())
                    }
                    if(!allClients.includes(data[i].client.toString())) {
                        allClients.push(data[i].client.toString())
                    }
                    statistic[district._id].profit += data[i].allPrice - data[i].returnedPrice
                    allProfit += data[i].allPrice - data[i].returnedPrice
                    statistic[district._id].returned += data[i].returnedPrice
                    allReturned += data[i].returnedPrice

                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[district._id].consignmentPrice += data[i].consignmentPrice
                        allConsignment += data[i].consignmentPrice
                    }
                }
            }

            const keys = Object.keys(statistic)
            data = []
            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].name,
                        statistic[keys[i]].client.length,
                        statistic[keys[i]].invoice,
                        checkFloat(statistic[keys[i]].profit),
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit/statistic[keys[i]].invoice),
                        checkFloat(statistic[keys[i]].profit*100/allProfit)
                    ]
                })
            }

            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'Всего',
                    data: [
                        allClients.length,
                        allOrders,
                        checkFloat(allProfit),
                        checkFloat(allReturned),
                        checkFloat(allConsignment)
                    ]
                },
                ...data
            ]

            data = {
                columns: [organization?'район':'организация', 'клиенты(шт)', 'заказы(шт)', 'выручка(сом)', 'отказы(сом)', 'конс(сом)', 'средний чек(сом)', 'процент'],
                row: data
            }
            return data;
        }
    },
    statisticClients: async(parent, { company, dateStart, dateType, online  }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            company = user.organization?user.organization:company
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)
                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let excludedAgents = []
            let profitAll = 0
            let returnedAll = 0
            let consignmentPriceAll = 0
            let completAll = 0
            if(online){
                excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                excludedAgents = await EmploymentAzyk.find({user: {$in: excludedAgents}}).distinct('_id').lean()
            }
            let statistic = {}
            let data = await InvoiceAzyk.find(
                {
                    $and: [
                        dateStart?{createdAt: {$gte: dateStart}}:{},
                        dateEnd?{createdAt: {$lt: dateEnd}}:{}
                    ],
                    del: {$ne: 'deleted'},
                    taken: true,
                    ...(company==='all'?{}:{ organization: company }),
                    agent: {$nin: excludedAgents}
                }
            )
                .select('client returnedPrice _id allPrice paymentConsignation consignmentPrice')
                .populate({
                    path: 'client',
                    select: 'name _id address'
                })
                .lean()
            for(let i=0; i<data.length; i++) {
                if (!(data[i].client.name.toLowerCase()).includes('агент')&&!(data[i].client.name.toLowerCase()).includes('agent')) {
                    if (!statistic[data[i].client._id])
                        statistic[data[i].client._id] = {
                            profit: 0,
                            returned: 0,
                            complet: 0,
                            consignmentPrice: 0,
                            client: `${data[i].client.name}${data[i].client.address&&data[i].client.address[0]?` (${data[i].client.address[0][2]?`${data[i].client.address[0][2]}, `:''}${data[i].client.address[0][0]})`:''}`
                        }
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[data[i].client._id].complet += 1
                        completAll += 1
                    }
                    statistic[data[i].client._id].profit += data[i].allPrice - data[i].returnedPrice
                    profitAll += data[i].allPrice - data[i].returnedPrice
                    statistic[data[i].client._id].returned += data[i].returnedPrice
                    returnedAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[data[i].client._id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }
                }
            }
            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].client,
                        checkFloat( statistic[keys[i]].profit),
                        statistic[keys[i]].complet,
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit/statistic[keys[i]].complet),
                        checkFloat(statistic[keys[i]].profit*100/profitAll)
                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(profitAll),
                        completAll,
                        checkFloat(returnedAll),
                        checkFloat(consignmentPriceAll),
                    ]
                },
                ...data
            ]
            return {
                columns: ['клиент', 'выручка(сом)', 'выполнен(шт)', 'отказы(сом)', 'конс(сом)', 'средний чек(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticAdss: async(parent, { company, dateStart, dateType, online }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            company = user.organization?user.organization:company
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }

            let statistic = {}
            let excludedAgents = []
            let profitAll = 0
            let returnedAll = 0
            let allConsignment = 0
            let completAll = []
            if(online){
                excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                excludedAgents = await EmploymentAzyk.find({user: {$in: excludedAgents}}).distinct('_id').lean()
            }
            let adss = await AdsAzyk.find({ ...(company==='all'?{}:{ organization: company }),}).distinct('_id').lean()
            let data = await InvoiceAzyk.find(
                {
                    $and: [
                        dateStart?{createdAt: {$gte: dateStart}}:{},
                        dateEnd?{createdAt: {$lt: dateEnd}}:{}
                    ],
                    ...(company==='all'?{}:{ organization: company }),
                    adss: {$elemMatch: {$in: adss}},
                    del: {$ne: 'deleted'},
                    taken: true,
                    agent: {$nin: excludedAgents},
                }
            )
                .select('adss allPrice _id returnedPrice consignmentPrice paymentConsignation')
                .populate({
                    path: 'adss',
                    select: '_id title'
                })
                .lean()
            for(let i=0; i<data.length; i++) {
                    for(let i1=0; i1<data[i].adss.length; i1++) {
                        if (!statistic[data[i].adss[i1]._id]) statistic[data[i].adss[i1]._id] = {
                            profit: 0,
                            returned: 0,
                            complet: [],
                            consignmentPrice: 0,
                            ads: data[i].adss[i1].title
                        }
                        if(data[i].allPrice!==data[i].returnedPrice&&!statistic[data[i].adss[i1]._id].complet.includes(data[i]._id.toString()))
                            statistic[data[i].adss[i1]._id].complet.push(data[i]._id.toString())

                        if(!completAll.includes(data[i]._id.toString())) {
                            completAll.push(data[i]._id.toString())
                            if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                                allConsignment += data[i].consignmentPrice
                            }
                            profitAll += data[i].allPrice - data[i].returnedPrice
                            returnedAll += data[i].returnedPrice
                        }

                        statistic[data[i].adss[i1]._id].profit += data[i].allPrice - data[i].returnedPrice
                        statistic[data[i].adss[i1]._id].returned += data[i].returnedPrice

                        if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                            statistic[data[i].adss[i1]._id].consignmentPrice += data[i].consignmentPrice
                        }
                    }
            }
            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].ads,
                        checkFloat(statistic[keys[i]].profit),
                        statistic[keys[i]].complet.length,
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit*100/profitAll)
                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(profitAll),
                        completAll.length,
                        checkFloat(returnedAll),
                        checkFloat(allConsignment),
                    ]
                },
                ...data
            ]
            return {
                columns: ['акция', 'выручка(сом)', 'выполнен(шт)', 'возврат(сом)', 'конс(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticItem: async(parent, { company, dateStart, dateType, online }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            //console.time('get BD')
            company = user.organization?user.organization:company
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }

            let statistic = {}
            let excludedAgents = []
            let profitAll = 0
            let returnedAll = 0
            let consignmentPriceAll = 0
            let completAll = []

            if(online){
                excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                excludedAgents = await EmploymentAzyk.find({user: {$in: excludedAgents}}).distinct('_id').lean()
            }
            let data = await InvoiceAzyk.find(
                {
                    $and: [
                        dateStart?{createdAt: {$gte: dateStart}}:{},
                        dateEnd?{createdAt: {$lt: dateEnd}}:{}
                    ],
                    ...(company==='all'?{}:{ organization: company }),
                    del: {$ne: 'deleted'},
                    taken: true,
                    agent: {$nin: excludedAgents},
                }
            )
                .select('orders item _id paymentConsignation')
                .populate({
                    path: 'orders',
                    select: 'item createdAt _id allPrice count returned consignmentPrice',
                    populate : [
                        {
                            path : 'item',
                            select: 'name _id',
                        }
                    ]
                })
                .lean()
            for(let i=0; i<data.length; i++) {
                for(let ii=0; ii<data[i].orders.length; ii++) {
                    data[i].orders[ii].invoice = data[i]._id
                    data[i].orders[ii].paymentConsignation = data[i].paymentConsignation
                }
            }
            data = data.reduce((acc, val) => acc.concat(val.orders), []);
            for(let i=0; i<data.length; i++) {
                if (!statistic[data[i].item._id]) statistic[data[i].item._id] = {
                    profit: 0,
                    returned: 0,
                    consignmentPrice: 0,
                    complet: [],
                    item: data[i].item.name
                }
                if(data[i].returned!==data[i].count&&!statistic[data[i].item._id].complet.includes(data[i].invoice.toString())) {
                    statistic[data[i].item._id].complet.push(data[i].invoice.toString())
                }
                if(data[i].returned!==data[i].count&&!completAll.includes(data[i].invoice.toString())) {
                    completAll.push(data[i].invoice.toString())
                }
                statistic[data[i].item._id].profit += (data[i].allPrice - data[i].returned * (data[i].allPrice/data[i].count))
                profitAll += (data[i].allPrice - data[i].returned * (data[i].allPrice/data[i].count))
                statistic[data[i].item._id].returned += data[i].returned * (data[i].allPrice/data[i].count)
                returnedAll += data[i].returned * (data[i].allPrice/data[i].count)
                if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                    statistic[data[i].item._id].consignmentPrice += data[i].consignmentPrice
                    consignmentPriceAll += data[i].consignmentPrice
                }
            }
            const keys = Object.keys(statistic)
            data = []
            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].item,
                        checkFloat(statistic[keys[i]].profit),
                        statistic[keys[i]].complet.length,
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit/statistic[keys[i]].complet.length),
                        checkFloat(statistic[keys[i]].profit*100/profitAll)
                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(profitAll),
                        completAll.length,
                        checkFloat(returnedAll),
                        checkFloat(consignmentPriceAll)
                    ]
                },
                ...data
            ]
            //console.timeEnd('get BD')
            return {
                columns: ['товар', 'выручка(сом)', 'выполнен(шт)', 'отказов(шт)', 'конс(сом)', 'средний чек(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticDistributer: async(parent, { distributer, organization, dateStart, dateType, type }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            distributer = user.organization?user.organization:distributer
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)
                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let statistic = {}, data = []
            if(distributer){
                let findDistributer = await DistributerAzyk.findOne(
                    distributer!=='super'?
                        {distributer: distributer}
                        :
                        {distributer: null}
                )
                    .populate('sales')
                if(findDistributer){
                    if(type==='all') {
                        let clients = await DistrictAzyk
                            .find({organization: distributer!=='super'?distributer:null})
                            .distinct('client')
                        let organizations = []
                        if(organization){
                            for (let i = 0; i < findDistributer.sales.length; i++) {
                                if(findDistributer.sales[i]._id.toString()===organization.toString())
                                    organizations.push(findDistributer.sales[i])
                            }
                        }
                        else
                            organizations = findDistributer.sales
                        data = await InvoiceAzyk.find(
                            {
                                $and: [
                                    dateStart ? {createdAt: {$gte: dateStart}} : {},
                                    dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                                ],
                                taken: true,
                                del: {$ne: 'deleted'},
                                organization: {$in: organizations.map(element=>element._id)},
                                client: {$in: clients}
                            }
                        )
                            .select('organization agent returnedPrice allPrice _id consignmentPrice paymentConsignation')
                            .populate({
                                path: 'organization',
                                select: '_id name'
                            })
                            .populate({
                                path: 'agent',
                                select: 'user organization',
                                populate: [{
                                    path: 'user',
                                    select: 'role',
                                }]})
                            .lean()
                        for (let i = 0; i < data.length; i++) {
                            let type = data[i].agent&&data[i].agent.organization&&data[i].agent.organization.toString()===distributer.toString()?'оффлайн':'онлайн'
                            let id = `${type}${data[i].organization._id}`
                            if (!statistic[id]) statistic[id] = {
                                profit: 0,
                                returned: 0,
                                cancel: [],
                                complet: [],
                                consignmentPrice: 0,
                                organization: `${data[i].organization.name} ${type}`
                            }
                            if(data[i].allPrice!==data[i].returnedPrice&&!statistic[id].complet.includes(data[i]._id.toString())) {
                                statistic[id].complet.push(data[i]._id.toString())
                            }
                            statistic[id].profit += data[i].allPrice - data[i].returnedPrice
                            statistic[id].returned += data[i].returnedPrice
                            if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                                statistic[id].consignmentPrice += data[i].consignmentPrice
                            }
                        }
                    }
                    else if(type==='districts') {
                        let districts = await DistrictAzyk
                            .find({organization: distributer!=='super'?distributer:null})
                        let organizations = []
                        if(organization){
                            for (let i = 0; i < findDistributer.sales.length; i++) {
                                if(findDistributer.sales[i]._id.toString()===organization.toString())
                                    organizations.push(findDistributer.sales[i])
                            }
                        }
                        else
                            organizations = findDistributer.sales
                        for (let i = 0; i < districts.length; i++) {
                            data = await InvoiceAzyk.find(
                                {
                                    $and: [
                                        dateStart ? {createdAt: {$gte: dateStart}} : {},
                                        dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                                    ],
                                    taken: true,
                                    del: {$ne: 'deleted'},
                                    organization: {$in: organizations.map(element=>element._id)},
                                    client: {$in: districts[i].client}
                                }
                            )
                                .select('returnedPrice allPrice _id consignmentPrice paymentConsignation')
                                .lean()
                            for (let i1 = 0; i1 < data.length; i1++) {
                                let id = districts[i]._id
                                if (!statistic[id]) statistic[id] = {
                                    profit: 0,
                                    returned: 0,
                                    cancel: [],
                                    complet: [],
                                    consignmentPrice: 0,
                                    organization: districts[i].name
                                }
                                if(data[i1].allPrice!==data[i1].returnedPrice&&!statistic[id].complet.includes(data[i1]._id.toString())) {
                                    statistic[id].complet.push(data[i1]._id.toString())
                                }
                                statistic[id].returned += data[i1].returnedPrice
                                statistic[id].profit += data[i1].allPrice - data[i1].returnedPrice
                                if (data[i1].consignmentPrice && !data[i1].paymentConsignation) {
                                    statistic[id].consignmentPrice += data[i1].consignmentPrice
                                }
                            }
                        }

                    }
                    else if(type==='agents') {
                        let clients = await DistrictAzyk
                            .find({organization: distributer!=='super'?distributer:null})
                            .distinct('client')
                        let organizations = []
                        if(organization){
                            for (let i = 0; i < findDistributer.sales.length; i++) {
                                if(findDistributer.sales[i]._id.toString()===organization.toString())
                                    organizations.push(findDistributer.sales[i])
                            }
                        }
                        else
                            organizations = findDistributer.sales
                        data = await InvoiceAzyk.find(
                            {
                                $and: [
                                    dateStart ? {createdAt: {$gte: dateStart}} : {},
                                    dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                                ],
                                taken: true,
                                del: {$ne: 'deleted'},
                                organization: {$in: organizations.map(element=>element._id)},
                                client: {$in: clients},
                            }
                        )
                            .select('agent returnedPrice allPrice _id consignmentPrice paymentConsignation')
                            .populate({
                                path: 'agent',
                                select: 'user name organization',
                                populate: [{
                                    path: 'user',
                                    select: 'role',
                                }]})
                            .lean()
                        for (let i1 = 0; i1 < data.length; i1++) {
                            let name = data[i1].agent&&data[i1].agent.organization&&data[i1].agent.organization.toString()===distributer.toString()?data[i1].agent.name:'AZYK.STORE'
                            let id = data[i1].agent&&data[i1].agent.organization&&data[i1].agent.organization.toString()===distributer.toString()?data[i1].agent._id:'AZYK.STORE'
                            if (!statistic[id]) statistic[id] = {
                                profit: 0,
                                returned: 0,
                                cancel: [],
                                complet: [],
                                consignmentPrice: 0,
                                organization: name
                            }
                            if(data[i1].allPrice!==data[i1].returnedPrice&&!statistic[id].complet.includes(data[i1]._id.toString())) {
                                statistic[id].complet.push(data[i1]._id.toString())
                            }
                            statistic[id].returned += data[i1].returnedPrice
                            statistic[id].profit += data[i1].allPrice - data[i1].returnedPrice
                            if (data[i1].consignmentPrice && !data[i1].paymentConsignation) {
                                statistic[id].consignmentPrice += data[i1].consignmentPrice
                            }
                        }
                    }
                }
            }

            const keys = Object.keys(statistic)
            data = []

            let profitAll = 0
            let returnedAll = 0
            let consignmentPriceAll = 0
            let completAll = 0

            for(let i=0; i<keys.length; i++){
                profitAll += statistic[keys[i]].profit
                returnedAll += statistic[keys[i]].returned
                consignmentPriceAll += statistic[keys[i]].consignmentPrice
                completAll += statistic[keys[i]].complet.length
            }
            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].organization,
                        checkFloat(statistic[keys[i]].profit),
                        statistic[keys[i]].complet.length,
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit/statistic[keys[i]].complet.length),
                        checkFloat(statistic[keys[i]].profit*100/profitAll)
                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(profitAll),
                        completAll,
                        checkFloat(returnedAll),
                        checkFloat(consignmentPriceAll),
                    ]
                },
                ...data
            ]
            return {
                columns: [type==='districts'?'район':type==='agents'?'агент':'организация', 'выручка(сом)', 'выполнен(шт)', 'отказов(сом)', 'конс(сом)', 'средний чек(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticOrder: async(parent, { company, dateStart, dateType, online }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            company = user.organization?user.organization:company
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let statistic = {}, data = []
            let excludedAgents = []
            let superOrganizations = []
            let profitAll = 0
            let consignmentPriceAll = 0
            let completAll = 0
            let returnedPriceAll = 0

            if(online){
                excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                excludedAgents = await EmploymentAzyk.find({user: {$in: excludedAgents}}).distinct('_id').lean()
            }
            if(!company) {
                data = await InvoiceAzyk.find(
                    {
                        $and: [
                            dateStart ? {createdAt: {$gte: dateStart}} : {},
                            dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                        ],
                        taken: true,
                        del: {$ne: 'deleted'},
                        agent: {$nin: excludedAgents}
                    }
                )
                    .select('client organization _id allPrice returnedPrice consignmentPrice paymentConsignation')
                    .populate({
                        path: 'organization',
                        select: '_id name'
                    })
                    .lean()

                for(let i=0; i<data.length; i++) {
                    if (!statistic[data[i].organization._id]) statistic[data[i].organization._id] = {
                        profit: 0,
                        complet: 0,
                        consignmentPrice: 0,
                        returnedPrice: 0,
                        clients: {},
                        organization: data[i].organization.name
                    }
                    if(!statistic[data[i].organization._id].clients[data[i].client]) {
                        statistic[data[i].organization._id].clients[data[i].client] = 1
                    }
                    statistic[data[i].organization._id].profit += data[i].allPrice - data[i].returnedPrice
                    profitAll += data[i].allPrice - data[i].returnedPrice
                    statistic[data[i].organization._id].returnedPrice += data[i].returnedPrice
                    returnedPriceAll += data[i].returnedPrice
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[data[i].organization._id].complet += 1
                        completAll += 1
                    }
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[data[i].organization._id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }

                }
            }
            else {
                let data = await DistrictAzyk.find({
                    ...(company!=='super'?{organization: company}:{organization: null}),
                    name: {$ne: 'super'}
                })
                    .select('_id name client')
                    .lean()
                let districts = {}
                for(let i=0; i<data.length; i++) {
                    for(let i1=0; i1<data[i].client.length; i1++) {
                        districts[data[i].client[i1].toString()] = data[i]
                    }
                }
                data = await InvoiceAzyk.find(
                    {
                        $and: [
                            dateStart ? {createdAt: {$gte: dateStart}} : {},
                            dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                        ],
                        del: {$ne: 'deleted'},
                        taken: true,
                        ...(company!=='super'?{organization: company}:{...online?{organization: {$in: superOrganizations}}:{}}),
                        agent: {$nin: excludedAgents},
                    }
                )
                    .select('_id returnedPrice allPrice paymentConsignation consignmentPrice client')
                    .lean()
                for(let i=0; i<data.length; i++) {
                    let district = {_id: 'Прочие', name: 'Прочие'}
                    if(districts[data[i].client.toString()]) {
                        district = districts[data[i].client.toString()]
                    }

                    if (!statistic[district._id])
                        statistic[district._id] = {
                            profit: 0,
                            complet: 0,
                            consignmentPrice: 0,
                            returnedPrice: 0,
                            clients: {},
                            organization: district.name
                        }
                    if(!statistic[district._id].clients[data[i].client]) {
                        statistic[district._id].clients[data[i].client] = 1
                    }
                    statistic[district._id].profit += data[i].allPrice - data[i].returnedPrice
                    profitAll += data[i].allPrice - data[i].returnedPrice
                    statistic[district._id].returnedPrice += data[i].returnedPrice
                    returnedPriceAll += data[i].returnedPrice
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[district._id].complet += 1
                        completAll += 1
                    }
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[district._id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }
                }

            }

            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].organization,
                        checkFloat(statistic[keys[i]].profit),
                        statistic[keys[i]].complet,
                        checkFloat(statistic[keys[i]].returnedPrice),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit/statistic[keys[i]].complet),
                        Object.keys(statistic[keys[i]].clients).length,
                        checkFloat(statistic[keys[i]].profit*100/profitAll)
                    ]
                })
            }

            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(profitAll),
                        completAll,
                        checkFloat(returnedPriceAll),
                        checkFloat(consignmentPriceAll),
                    ]
                },
                ...data
            ]
            return {
                columns: [company?'район':'организация', 'выручка(сом)', 'выполнен(шт)', 'отказы(сом)', 'конс(сом)', 'средний чек(сом)', 'клиенты', 'процент'],
                row: data
            };
        }
    },
    statisticAzykStoreOrder: async(parent, { company, dateStart, dateType, filter }, {user}) => {
        if(['admin'].includes(user.role)){
            let dateEnd
            let statistic = {}, data = []
            let priceAll = 0
            let profitAll = 0
            let profit = 0
            let consignmentPriceAll = 0
            let completAll = 0
            let returnedPriceAll = 0
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)
                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let organizations
            let agents = await EmploymentAzyk.find({organization: null})
                .select('_id')
                .populate({
                    path: 'user',
                    select: 'role'
                })
                .lean()
            agents = agents.filter(agent => agent.user.role === 'суперагент')
            agents = agents.map(agent=>agent._id)
            if(!company){
                organizations = await OrganizationAzyk.find({superagent: true}).distinct('_id')
            }
            else {
                organizations = await OrganizationAzyk.find({_id: company, superagent: true}).distinct('_id')
            }
            data = await InvoiceAzyk.find(
                {
                    $and: [
                        dateStart ? {createdAt: {$gte: dateStart}} : {},
                        dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                    ],
                    del: {$ne: 'deleted'},
                    taken: true,
                    organization: {$in: organizations},
                    $or: [{agent: {$in: agents}}, {agent: null}]
                }
            )
                .select('_id returnedPrice allPrice paymentConsignation consignmentPrice organization client')
                .populate({
                    path : 'organization',
                    select: 'name _id'
                })
                .populate({
                    path : 'orders',
                    select: 'allPrice count returned costPrice'
                })
                .lean()
            if(filter==='район'||company){
                let districts = await DistrictAzyk.find({
                    organization: null,
                    name: {$ne: 'super'}
                })
                    .select('_id name client')
                    .lean()
                for(let i=0; i<data.length; i++) {
                    for(let i1=0; i1<districts.length; i1++) {
                        if(districts[i1].client.toString().includes(data[i].client.toString()))
                            data[i].district = districts[i1]
                    }
                    if(!data[i].district)
                        data[i].district = {_id: 'lol', name: 'Без района'}
                }
                for(let i=0; i<data.length; i++) {
                    if (!statistic[data[i].district._id]) statistic[data[i].district._id] = {
                        price: 0,
                        profit: 0,
                        complet: 0,
                        consignmentPrice: 0,
                        returnedPrice: 0,
                        organization: data[i].district.name,
                        clients: {}
                    }
                    profit = 0
                    for(let i1=0; i1<data[i].orders.length; i1++) {
                        if(data[i].orders[i1].costPrice){
                            profit += ((data[i].orders[i1].allPrice/data[i].orders[i1].count)*(data[i].orders[i1].count-data[i].orders[i1].returned)) - (data[i].orders[i1].costPrice*(data[i].orders[i1].count-data[i].orders[i1].returned))
                        }
                    }
                    statistic[data[i].district._id].profit += profit
                    profitAll += profit
                    if (!statistic[data[i].district._id].clients[data[i].client]) {
                        statistic[data[i].district._id].clients[data[i].client] = 1
                    }
                    if (data[i].allPrice!==data[i].returnedPrice) {
                        statistic[data[i].district._id].complet += 1
                        completAll += 1
                    }
                    statistic[data[i].district._id].price += data[i].allPrice - data[i].returnedPrice
                    priceAll += data[i].allPrice - data[i].returnedPrice
                    statistic[data[i].district._id].returnedPrice += data[i].returnedPrice
                    returnedPriceAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[data[i].district._id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }

                }
            }
            else {
                for(let i=0; i<data.length; i++) {
                    if (!statistic[data[i].organization._id]) statistic[data[i].organization._id] = {
                        price: 0,
                        profit: 0,
                        complet: 0,
                        consignmentPrice: 0,
                        returnedPrice: 0,
                        organization: data[i].organization.name,
                        clients: {}
                    }
                    profit = 0
                    for(let i1=0; i1<data[i].orders.length; i1++) {
                        if(data[i].orders[i1].costPrice){
                            profit += ((data[i].orders[i1].allPrice/data[i].orders[i1].count)*(data[i].orders[i1].count-data[i].orders[i1].returned)) - (data[i].orders[i1].costPrice*(data[i].orders[i1].count-data[i].orders[i1].returned))
                        }
                    }
                    statistic[data[i].organization._id].profit += profit
                    profitAll += profit
                    if (!statistic[data[i].organization._id].clients[data[i].client]) {
                        statistic[data[i].organization._id].clients[data[i].client] = 1
                    }
                    if (data[i].allPrice!==data[i].returnedPrice) {
                        statistic[data[i].organization._id].complet += 1
                        completAll += 1
                    }
                    statistic[data[i].organization._id].price += data[i].allPrice - data[i].returnedPrice
                    priceAll += data[i].allPrice - data[i].returnedPrice
                    statistic[data[i].organization._id].returnedPrice += data[i].returnedPrice
                    returnedPriceAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[data[i].organization._id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }

                }

            }
            const keys = Object.keys(statistic)
            data = []


            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].organization,
                        checkFloat(statistic[keys[i]].price),
                        statistic[keys[i]].complet,
                        checkFloat(statistic[keys[i]].returnedPrice),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit),
                        checkFloat(statistic[keys[i]].price/statistic[keys[i]].complet),
                        Object.keys(statistic[keys[i]].clients).length,
                        checkFloat(statistic[keys[i]].price*100/priceAll)
                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(priceAll),
                        completAll,
                        checkFloat(returnedPriceAll),
                        checkFloat(consignmentPriceAll),
                        checkFloat(profitAll),
                    ]
                },
                ...data
            ]
            return {
                columns: ['район', 'выручка(сом)', 'выполнен(шт)', 'отказы(сом)', 'конс(сом)', 'прибыль(сом)', 'средний чек(сом)', 'клиенты', 'процент'],
                row: data
            };
        }
    },
    statisticGeoOrder: async(parent, { organization, dateStart }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            dateStart= new Date(dateStart)
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let data = await InvoiceAzyk.find(
                {
                    $and: [{dateDelivery: {$gte: dateStart}}, {dateDelivery: {$lt: dateEnd}}],
                    taken: true,
                    del: {$ne: 'deleted'},
                    organization: organization
                }
            ).select('address').lean()
            data = data.map(element=>element.address)
            return data
        }
    },
    statisticReturned: async(parent, { company, dateStart, dateType }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            company = user.organization?user.organization:company
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let statistic = {}, data = []

            let profitAll = 0
            let completAll = 0

            if(!company) {
                data = await ReturnedAzyk.find(
                    {
                        $and: [
                            dateStart ? {createdAt: {$gte: dateStart}} : {},
                            dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                        ],
                        confirmationForwarder: true,
                        del: {$ne: 'deleted'}
                    }
                )
                    .select('organization allPrice')
                    .populate({
                        path: 'organization',
                        select: 'name _id'
                    })
                    .lean()

                for(let i=0; i<data.length; i++) {
                        if (!statistic[data[i].organization._id]) statistic[data[i].organization._id] = {
                            profit: 0,
                            complet: 0,
                            organization: data[i].organization.name
                        }
                        statistic[data[i].organization._id].complet+=1
                    profitAll += data[i].allPrice
                    statistic[data[i].organization._id].profit += data[i].allPrice
                    completAll += 1
                }
            }
            else {
                let data = await DistrictAzyk.find({
                    ...(company!=='super'?{organization: company}:{organization: null}),
                    name: {$ne: 'super'}
                })
                    .select('_id name client')
                    .lean()
                let districts = {}
                for(let i=0; i<data.length; i++) {
                    for(let i1=0; i1<data[i].client.length; i1++) {
                        districts[data[i].client[i1].toString()] = data[i]
                    }
                }
                data = await ReturnedAzyk.find(
                    {
                        $and: [
                            dateStart ? {createdAt: {$gte: dateStart}} : {},
                            dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                        ],
                        del: {$ne: 'deleted'},
                        confirmationForwarder: true,
                        organization: company,
                    }
                )
                    .select('allPrice client')
                    .lean()
                for(let i=0; i<data.length; i++) {
                    let district = {_id: 'Прочие', name: 'Прочие'}
                    if(districts[data[i].client.toString()]) {
                        district = districts[data[i].client.toString()]
                    }
                    if (!statistic[district._id])
                        statistic[district._id] = {
                            profit: 0,
                            complet: 0,
                            organization: district.name
                        }
                    statistic[district._id].profit += data[i].allPrice
                    profitAll += data[i].allPrice
                    statistic[district._id].complet += 1
                    completAll += 1
                }

            }

            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].organization,
                        checkFloat(statistic[keys[i]].profit),
                        statistic[keys[i]].complet,
                        checkFloat(statistic[keys[i]].profit*100/profitAll)
                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(profitAll),
                        completAll
                    ]
                },
                ...data
            ]
            return {
                columns: [company?'район':'организация', 'сумма(сом)', 'выполнен(шт)', 'процент'],
                row: data
            };
        }
    },
    statisticAgents: async(parent, { company, dateStart, dateType }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            company = user.organization?user.organization:company
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let statistic = {}, data = []

            let profitAll = 0
            let returnedAll = 0
            let consignmentPriceAll = 0
            let completAll = 0

            if(!company) {
                data = await InvoiceAzyk.find(
                    {
                        $and: [
                            dateStart ? {createdAt: {$gte: dateStart}} : {},
                            dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                        ],
                        taken: true,
                        del: {$ne: 'deleted'}
                    }
                )
                    .select('organization agent returnedPrice allPrice _id consignmentPrice paymentConsignation')
                    .populate({
                        path: 'organization',
                        select: '_id name'
                    })
                    .populate({
                        path: 'agent',
                        select: 'user',
                        populate: [{
                            path: 'user',
                            select: 'role',
                        }]})
                    .lean()
                for(let i=0; i<data.length; i++) {
                    let type = !data[i].agent||['суперменеджер', 'суперагент', 'суперэкспедитор'].includes(data[i].agent.user.role)?'онлайн':'оффлайн'
                    let id = `${type}${data[i].organization._id}`
                    if (!statistic[id]) statistic[id] = {
                        profit: 0,
                        returned: 0,
                        complet: 0,
                        consignmentPrice: 0,
                        organization: `${data[i].organization.name} ${type}`
                    }
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[id].complet += 1
                        completAll += 1
                    }
                    statistic[id].profit += data[i].allPrice - data[i].returnedPrice
                    profitAll += data[i].allPrice - data[i].returnedPrice
                    statistic[id].returned += data[i].returnedPrice
                    returnedAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }

                }
            }
            else {
                data = await InvoiceAzyk.find(
                    {
                        $and: [
                            dateStart ? {createdAt: {$gte: dateStart}} : {},
                            dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                        ],
                        del: {$ne: 'deleted'},
                        taken: true,
                        organization: company
                    }
                )
                    .select('organization agent returnedPrice allPrice _id consignmentPrice paymentConsignation')
                    .populate({
                        path: 'agent',
                        select: 'user _id name',
                        populate: [{
                            path: 'user',
                            select: 'role',
                        }]})
                    .lean()

                for(let i=0; i<data.length; i++) {
                    let agent = !data[i].agent||['суперменеджер', 'суперагент', 'суперэкспедитор'].includes(data[i].agent.user.role)?{_id: 'AZYK.STORE', name: 'AZYK.STORE'}:{name: data[i].agent.name, _id: data[i].agent._id.toString()}

                    if(!statistic[agent._id]) {
                        statistic[agent._id] = {
                            profit: 0,
                            returned: 0,
                            complet: 0,
                            consignmentPrice: 0,
                            organization: agent.name
                        }
                    }

                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[agent._id].complet += 1
                        completAll += 1
                    }
                    statistic[agent._id].profit += data[i].allPrice - data[i].returnedPrice
                    profitAll += data[i].allPrice - data[i].returnedPrice
                    statistic[agent._id].returned += data[i].returnedPrice
                    returnedAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[agent._id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }
                }

            }

            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].organization,
                        checkFloat(statistic[keys[i]].profit),
                        statistic[keys[i]].complet,
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit/statistic[keys[i]].complet),
                        checkFloat(statistic[keys[i]].profit*100/profitAll)
                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(profitAll),
                        completAll,
                        checkFloat(returnedAll),
                        checkFloat(consignmentPriceAll)
                    ]
                },
                ...data
            ]
            return {
                columns: [company?'агент':'агент', 'выручка(сом)', 'выполнен(шт)', 'отказов(сом)', 'конс(сом)', 'средний чек(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticAzykStoreAgents: async(parent, { company, dateStart, dateType, filter }, {user}) => {
        if('admin'===user.role){
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let statistic = {}, data = []

            let priceAll = 0
            let returnedAll = 0
            let consignmentPriceAll = 0
            let completAll = 0
            let profitAll = 0
            let profit = 0

            let organizations
            let agents = await EmploymentAzyk.find({organization: null})
                .select('_id')
                .populate({
                    path: 'user',
                    select: 'role'
                })
                .lean()
            agents = agents.filter(agent => agent.user.role === 'суперагент')
            agents = agents.map(agent=>agent._id)
            if(!company){
                organizations = await OrganizationAzyk.find({superagent: true}).distinct('_id')
            }
            else {
                organizations = await OrganizationAzyk.find({_id: company, superagent: true}).distinct('_id')
            }
            data = await InvoiceAzyk.find(
                {
                    $and: [
                        dateStart ? {createdAt: {$gte: dateStart}} : {},
                        dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                    ],
                    taken: true,
                    del: {$ne: 'deleted'},
                    organization: {$in: organizations},
                    $or: [{agent: {$in: agents}}, {agent: null}]
                }
            )
                .select('organization agent returnedPrice allPrice _id consignmentPrice paymentConsignation')
                .populate({
                    path: 'organization',
                    select: '_id name'
                })
                .populate({
                    path: 'agent',
                    select: 'name _id'
                })
                .populate({
                    path : 'orders',
                    select: 'allPrice count returned costPrice'
                })
                .lean()
            if(!company) {
                for(let i=0; i<data.length; i++) {
                    let type
                    let id
                    let name
                    if(filter==='агент'){
                        name = data[i].agent?data[i].agent.name:'AZYK.STORE'
                        id = data[i].agent?data[i].agent._id:'AZYK.STORE'
                    }
                    else{
                        type = data[i].agent?'оффлайн':'онлайн'
                        id = `${type}${data[i].organization._id}`
                        name = `${data[i].organization.name} ${type}`
                    }
                    if (!statistic[id])
                        statistic[id] = {
                            price: 0,
                            returned: 0,
                            complet: 0,
                            consignmentPrice: 0,
                            organization: name,
                            profit: 0
                        }
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[id].complet += 1
                        completAll += 1
                    }
                    statistic[id].price += data[i].allPrice - data[i].returnedPrice
                    priceAll += data[i].allPrice - data[i].returnedPrice
                    statistic[id].returned += data[i].returnedPrice
                    returnedAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }
                    profit = 0
                    for(let i1=0; i1<data[i].orders.length; i1++) {
                        if(data[i].orders[i1].costPrice){
                            profit += ((data[i].orders[i1].allPrice/data[i].orders[i1].count)*(data[i].orders[i1].count-data[i].orders[i1].returned)) - (data[i].orders[i1].costPrice*(data[i].orders[i1].count-data[i].orders[i1].returned))
                        }
                    }
                    statistic[id].profit += profit
                    profitAll += profit


                }
            }
            else {
                for(let i=0; i<data.length; i++) {
                    let name = data[i].agent?data[i].agent.name:'AZYK.STORE'
                    let id = data[i].agent?data[i].agent._id:'AZYK.STORE'
                    if (!statistic[id])
                        statistic[id] = {
                            price: 0,
                            returned: 0,
                            complet: 0,
                            consignmentPrice: 0,
                            organization: name,
                            profit: 0
                        }
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[id].complet += 1
                        completAll += 1
                    }
                    statistic[id].price += data[i].allPrice - data[i].returnedPrice
                    priceAll += data[i].allPrice - data[i].returnedPrice
                    statistic[id].returned += data[i].returnedPrice
                    returnedAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }
                    profit = 0
                    for(let i1=0; i1<data[i].orders.length; i1++) {
                        if(data[i].orders[i1].costPrice){
                            profit += ((data[i].orders[i1].allPrice/data[i].orders[i1].count)*(data[i].orders[i1].count-data[i].orders[i1].returned)) - (data[i].orders[i1].costPrice*(data[i].orders[i1].count-data[i].orders[i1].returned))
                        }
                    }
                    statistic[id].profit += profit
                    profitAll += profit


                }
            }

            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].organization,
                        checkFloat(statistic[keys[i]].price),
                        statistic[keys[i]].complet,
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit),
                        checkFloat(statistic[keys[i]].price/statistic[keys[i]].complet),
                        checkFloat(statistic[keys[i]].price*100/priceAll)

                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[0] - a.data[0]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(priceAll),
                        completAll,
                        checkFloat(returnedAll),
                        checkFloat(consignmentPriceAll),
                        checkFloat(profitAll)
                    ]
                },
                ...data
            ]
            return {
                columns: ['агент', 'выручка(сом)', 'выполнен(шт)', 'отказов(сом)', 'конс(сом)', 'прибыль(сом)', 'средний чек(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticClient: async(parent, { client, dateStart, dateType, online }, {user}) => {
        if('admin'===user.role){
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let statistic = {}, data = []

            let profitAll = 0
            let returnedAll = 0
            let consignmentPriceAll = 0
            let completAll = 0
            if(client){
                let excludedAgents = []
                if(online){
                    excludedAgents = await UserAzyk.find({$or: [{role: 'агент'}, {role: 'менеджер'}, {role: 'организация'}, {role: 'суперорганизация'}]}).distinct('_id').lean()
                    excludedAgents = await EmploymentAzyk.find({user: {$in: excludedAgents}}).distinct('_id').lean()
                }
                data = await InvoiceAzyk.find(
                    {
                        $and: [
                            dateStart ? {createdAt: {$gte: dateStart}} : {},
                            dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                        ],
                        taken: true,
                        del: {$ne: 'deleted'},
                        client: client,
                        agent: {$nin: excludedAgents}
                    }
                )
                    .select('organization agent returnedPrice allPrice _id consignmentPrice paymentConsignation')
                    .populate({
                        path: 'organization',
                        select: '_id name'
                    })
                    .lean()
                for(let i=0; i<data.length; i++) {
                    if (!statistic[data[i].organization._id]) statistic[data[i].organization._id] = {
                        profit: 0,
                        returned: 0,
                        complet: 0,
                        consignmentPrice: 0,
                        organization: data[i].organization.name
                    }
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[data[i].organization._id].complet += 1
                        completAll += 1
                    }
                    statistic[data[i].organization._id].profit += data[i].allPrice - data[i].returnedPrice
                    profitAll += data[i].allPrice - data[i].returnedPrice
                    statistic[data[i].organization._id].returned += data[i].returnedPrice
                    returnedAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[data[i].organization._id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }
                }
            }

            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].organization,
                        checkFloat(statistic[keys[i]].profit),
                        statistic[keys[i]].complet,
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit/statistic[keys[i]].complet),
                        checkFloat(statistic[keys[i]].profit*100/profitAll)

                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[0] - a.data[0]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(profitAll),
                        completAll,
                        checkFloat(returnedAll),
                        checkFloat(consignmentPriceAll)
                    ]
                },
                ...data
            ]
            return {
                columns: ['организация', 'выручка(сом)', 'выполнен(шт)', 'отказов(сом)', 'конс(сом)', 'средний чек(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticAzykStoreAgent: async(parent, { agent, dateStart, dateType }, {user}) => {
        if('admin'===user.role){
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let statistic = {}, data = []
            let profitAll = 0
            let profit = 0
            let priceAll = 0
            let returnedAll = 0
            let consignmentPriceAll = 0
            let completAll = 0
            if(agent){
                data = await InvoiceAzyk.find(
                    {
                        $and: [
                            dateStart ? {createdAt: {$gte: dateStart}} : {},
                            dateEnd ? {createdAt: {$lt: dateEnd}} : {}
                        ],
                        taken: true,
                        del: {$ne: 'deleted'},
                        agent: agent
                    }
                )
                    .select('organization agent returnedPrice allPrice _id consignmentPrice paymentConsignation')
                    .populate({
                        path: 'organization',
                        select: '_id name'
                    })
                    .populate({
                        path : 'orders',
                        select: 'allPrice count returned costPrice'
                    })
                    .lean()
                for(let i=0; i<data.length; i++) {
                    if (!statistic[data[i].organization._id]) statistic[data[i].organization._id] = {
                        price: 0,
                        returned: 0,
                        complet: 0,
                        consignmentPrice: 0,
                        organization: data[i].organization.name,
                        profit: 0
                    }
                    profit = 0
                    for(let i1=0; i1<data[i].orders.length; i1++) {
                        if(data[i].orders[i1].costPrice){
                            profit += ((data[i].orders[i1].allPrice/data[i].orders[i1].count)*(data[i].orders[i1].count-data[i].orders[i1].returned)) - (data[i].orders[i1].costPrice*(data[i].orders[i1].count-data[i].orders[i1].returned))
                        }
                    }
                    statistic[data[i].organization._id].profit += profit
                    profitAll += profit
                    if(data[i].allPrice!==data[i].returnedPrice) {
                        statistic[data[i].organization._id].complet += 1
                        completAll += 1
                    }
                    statistic[data[i].organization._id].price += data[i].allPrice - data[i].returnedPrice
                    priceAll += data[i].allPrice - data[i].returnedPrice
                    statistic[data[i].organization._id].returned += data[i].returnedPrice
                    returnedAll += data[i].returnedPrice
                    if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                        statistic[data[i].organization._id].consignmentPrice += data[i].consignmentPrice
                        consignmentPriceAll += data[i].consignmentPrice
                    }


                }
            }

            const keys = Object.keys(statistic)
            data = []

            for(let i=0; i<keys.length; i++){
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].organization,
                        checkFloat(statistic[keys[i]].price),
                        statistic[keys[i]].complet,
                        checkFloat(statistic[keys[i]].returned),
                        checkFloat(statistic[keys[i]].consignmentPrice),
                        checkFloat(statistic[keys[i]].profit),
                        checkFloat(statistic[keys[i]].price/statistic[keys[i]].complet),
                        checkFloat(statistic[keys[i]].price*100/priceAll)

                    ]
                })
            }
            data = data.sort(function(a, b) {
                return b.data[0] - a.data[0]
            });
            data = [
                {
                    _id: 'All',
                    data: [
                        data.length,
                        checkFloat(priceAll),
                        completAll,
                        checkFloat(returnedAll),
                        checkFloat(consignmentPriceAll),
                        checkFloat(profitAll)
                    ]
                },
                ...data
            ]
            return {
                columns: ['организация', 'выручка(сом)', 'выполнен(шт)', 'отказов(сом)', 'конс(сом)', 'прибыль(сом)', 'средний чек(сом)', 'процент'],
                row: data
            };
        }
    },
    statisticAgentsWorkTime: async(parent, { organization, date }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let dateStart = date?new Date(date):new Date()
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let data = []
            let agents = await UserAzyk.find({
                ...(organization!=='super'?
                        {$or: [{role: 'агент'}, {role: 'суперагент'}]}
                        :
                        {role: 'суперагент'}
                )
            })
                .distinct('_id')
                .lean()
            agents = await EmploymentAzyk.find({
                ...(organization&&organization!=='super'?{organization: organization}:{}),
                user: {$in: agents},
                del: {$ne: 'deleted'}
            })
                .select('_id name')
                .lean()
            for (let i = 0; i < agents.length; i++) {
                let orders = await InvoiceAzyk.find(
                    {
                        $and: [
                            {createdAt: {$gte: dateStart}},
                            {createdAt: {$lt: dateEnd}}
                        ],
                        del: {$ne: 'deleted'},
                        taken: true,
                        agent: agents[i]._id,
                    }
                )
                    .select('createdAt')
                    .sort('createdAt')
                    .lean()
                let agentHistoryGeoAzyks = await AgentHistoryGeoAzyk.find({
                    $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                    agent: agents[i]._id
                })
                    .distinct('_id')
                    .lean()
                data.push({
                    _id: agents[i]._id,
                    data: [
                        agents[i].name,
                        orders.length>0?pdHHMM(orders[0].createdAt):'-',
                        orders.length>0?pdHHMM(orders[orders.length-1].createdAt):'-',
                        orders.length,
                        agentHistoryGeoAzyks.length

                    ]
                })

            }
            return {
                columns: ['агент', 'начало', 'конец', 'заказов', 'посещений'],
                row: data
            };
        }
    },
    activeItem: async(parent, { organization }, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)){
            let data/* = await InvoiceAzyk.find(
                    {
                        del: {$ne: 'deleted'},
                        organization: organization,
                        taken: true,
                    }
                ).distinct('orders').lean()
            data = data.reduce((acc, val) => acc.concat(val), []);
            data = await OrderAzyk.find(
                {
                    _id: {$in: data},
                }
            ).distinct('item').lean()*/
            data = await ItemAzyk.find(
                {
                    /*_id: {$in: data}*/
                    organization: organization
                }
            )
                .sort('name')
                .lean()
            return data;
        }
    },
    activeOrganization: async(parent, ctx, {user}) => {
        if('admin'===user.role){
            let data = await OrganizationAzyk.find(
                {
                    /*_id: {$in: data}*/
                }
            )
                .sort('name')
                .lean()
            return data;
        }
        else if('суперагент'===user.role){
            let data = await OrganizationAzyk.find(
                {
                    status: 'active',
                    superagent: true,
                    del: {$ne: 'deleted'}
                }
            )
                .sort('name')
                .lean()
            return data;
        }
        else if('client'===user.role){
            let data = await OrganizationAzyk.find(
                {
                    status: 'active',
                    del: {$ne: 'deleted'}
                }
            )
                .sort('name')
                .lean()
            return data;
        }
        else if(['суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)){
            let data = await OrganizationAzyk.find(
                {
                    _id: user.organization
                }
            )
                .lean()
            return data;
        }
    },
    superagentOrganization: async(parent, ctx, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент'].includes(user.role)){
            let data = await OrganizationAzyk.find(
                {
                    superagent: true
                }
            )
                .sort('name')
                .lean()
            return data;
        }
    },
    statisticClientGeo: async(parent, { search, organization, item }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let clients = await UserAzyk.find({role: 'client', status: 'active'}).distinct('_id').lean()
            clients = await ClientAzyk.find({
                user: {$in: clients},
                del: {$ne: 'deleted'},
                ...search&&search.length?{$or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {email: {'$regex': search, '$options': 'i'}},
                    {city: {'$regex': search, '$options': 'i'}},
                    {info: {'$regex': search, '$options': 'i'}},
                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                ]}:{}
            })
                .select('address name _id notification lastActive')
                .lean()
            let address = []
            let good = 0
            let excellent = 0
            let bad = 0
            let goodClients = []
            let status
            let invoice
            let now = new Date()
            now.setDate(now.getDate() + 1)
            now.setHours(3, 0, 0, 0)
            let differenceDates;
            for(let x=0; x<clients.length;x++) {
                if(clients[x].address[0][1]&&clients[x].address[0][1].length>0&&!(clients[x].name.toLowerCase()).includes('агент')&&!(clients[x].name.toLowerCase()).includes('agent')) {
                    differenceDates = clients[x].lastActive?(now - new Date(clients[x].lastActive)) / (1000 * 60 * 60 * 24):999
                    if (differenceDates > 7&&!item&&!organization) {
                        status = 'red'
                        bad+=1
                        address.push({
                            client: clients[x]._id,
                            address: clients[x].address[0],
                            data: [JSON.stringify(clients[x].notification), status, `${x}0`]
                        })
                    }
                    else {
                        goodClients.push(clients[x])
                    }
                }
            }
            let invoices, sortInvoices = {}
            if(item){
                invoices =  await OrderAzyk.aggregate(
                    [
                        {
                            $match:{
                                client: {$in: goodClients.map(client=>client._id)},
                                status: {$ne: 'отмена'},
                                item: item
                            }
                        },
                        { $sort : {createdAt: -1, client: 1} },
                        {
                            $group:
                                {
                                    _id: '$client',
                                    createdAt: { $last: '$createdAt' }
                                }
                        },
                        { $project : { createdAt : 1 }}
                    ])
            }
            else{
                invoices =  await InvoiceAzyk.aggregate(
                    [
                        {
                            $match:{
                                ...organization?{organization: new mongoose.Types.ObjectId(organization)}:{},
                                client: {$in: goodClients.map(client=>client._id)},
                                del: {$ne: 'deleted'},
                                taken: true
                            }
                        },
                        { $project : { createdAt : 1, client: 1 }},
                        { $sort : {client: 1, createdAt: 1} },
                        {
                            $group:
                                {
                                    _id: '$client',
                                    createdAt: { $last: '$createdAt' }
                                }
                        }
                    ])
            }
            for(let x=0; x<invoices.length;x++) {
                sortInvoices[invoices[x]._id.toString()] = invoices[x]
            }
            for(let x=0; x<goodClients.length;x++) {
                invoice = sortInvoices[goodClients[x]._id.toString()]
                if(invoice) {
                    differenceDates = (now - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24)
                    if (differenceDates > 7) {
                        status = 'yellow'
                        good+=1
                    }
                    else {
                        status = 'green'
                        excellent+=1
                    }
                }
                else {
                    if(organization||item) {
                        status = 'red'
                        bad+=1
                    }
                    else {
                        status = 'yellow'
                        good+=1
                    }
                }
                address.push({
                    client: goodClients[x]._id,
                    address: goodClients[x].address[0],
                    data: [JSON.stringify(goodClients[x].notification), status, `${x}0`]
                })
            }


            address = [
                {
                    client: null,
                    address: null,
                    data: [excellent, good, bad]
                },
                ...address
            ]
            return address
        }
    },
    unloadingOrders: async(parent, { filter, organization, dateStart }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let workbook = new ExcelJS.Workbook();
            dateStart = new Date(dateStart)
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let data = await InvoiceAzyk.find(
                {
                    $and: filter==='Дата доставки'?[{dateDelivery: {$gte: dateStart}}, {dateDelivery: {$lt: dateEnd}}]:[{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                    del: {$ne: 'deleted'},
                    taken: true,
                    organization: organization
                }
            )
                .populate({
                    path: 'orders',
                    populate : [
                        {
                            path : 'item',
                        }
                    ]
                })
                .populate({
                    path : 'client',
                    select: 'name _id phone'
                })
                .populate({
                    path : 'agent',
                    select: 'name _id'
                })
                .populate({
                    path : 'adss'
                }).lean()
            let worksheet;
            worksheet = await workbook.addWorksheet('Заказы');
            worksheet.getColumn(1).width = 30;
            worksheet.getColumn(2).width = 20;
            worksheet.getColumn(3).width = 15;
            worksheet.getColumn(4).width = 15;
            worksheet.getColumn(5).width = 15;
            let row = 1;
            for(let i = 0; i<data.length;i++){
                if(i!==0) {
                    row += 2;
                }
                worksheet.getCell(`A${row}`).font = {bold: true, size: 14};
                worksheet.getCell(`A${row}`).value = `Заказ${i+1}`;
                if(data[i].agent) {
                    row += 1;
                    worksheet.getCell(`A${row}`).font = {bold: true};
                    worksheet.getCell(`A${row}`).value = 'Агент:';
                    worksheet.getCell(`B${row}`).value = data[i].agent.name
                }
                row += 1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Дата доставки:';
                worksheet.getCell(`B${row}`).value = pdDDMMYYYY(data[i].dateDelivery)
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Клиент:';
                worksheet.getCell(`B${row}`).value = data[i].client.name;
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Адрес:';
                worksheet.getCell(`B${row}`).value = `${data[i].address[2] ? `${data[i].address[2]}, ` : ''}${data[i].address[0]}`;
                for(let i1=0; i1<data[i].client.phone.length; i1++) {
                    row+=1;
                    if(!i1) {
                        worksheet.getCell(`A${row}`).font = {bold: true};
                        worksheet.getCell(`A${row}`).value = 'Телефон:';
                    }
                    worksheet.getCell(`B${row}`).value = data[i].client.phone[i1];
                }
                if(data[i].adss) {
                    for(let i1=0; i1<data[i].adss.length; i1++) {
                        row+=1;
                        if(!i1) {
                            worksheet.getCell(`A${row}`).font = {bold: true};
                            worksheet.getCell(`A${row}`).value = 'Акция:';
                        }
                        worksheet.getCell(`B${row}`).value = data[i].adss[i1].title;
                    }
                }
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Сумма:';
                worksheet.getCell(`B${row}`).value = `${data[i].allPrice} сом`;
                if(data[i].consignmentPrice>0) {
                    row+=1;
                    worksheet.getCell(`A${row}`).font = {bold: true};
                    worksheet.getCell(`A${row}`).value = 'Консигнации:';
                    worksheet.getCell(`B${row}`).value = `${data[i].consignmentPrice} сом`;
                }
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Товары:';
                worksheet.getCell(`B${row}`).font = {bold: true};
                worksheet.getCell(`B${row}`).value = 'Количество:';
                worksheet.getCell(`C${row}`).font = {bold: true};
                worksheet.getCell(`C${row}`).value = 'Упаковок:';
                worksheet.getCell(`D${row}`).font = {bold: true};
                worksheet.getCell(`D${row}`).value = 'Сумма:';
                if(data[i].consignmentPrice>0) {
                    worksheet.getCell(`E${row}`).font = {bold: true};
                    worksheet.getCell(`E${row}`).value = 'Консигнации:';
                }
                for(let i1=0; i1<data[i].orders.length; i1++) {
                    row += 1;
                    worksheet.addRow([
                        data[i].orders[i1].item.name,
                        `${data[i].orders[i1].count} ${data[i].orders[i1].item.unit&&data[i].orders[i1].item.unit.length>0?data[i].orders[i1].item.unit:'шт'}`,
                        `${checkFloat(data[i].orders[i1].count/(data[i].orders[i1].packaging?data[i].orders[i1].packaging:1))} уп`,
                        `${data[i].orders[i1].allPrice} сом`,
                        data[i].orders[i1].consignmentPrice>0?`${data[i].orders[i1].consignmentPrice} сом`:''
                    ]);
                }
            }
            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return({data: urlMain + '/xlsx/' + xlsxname})
        }
    },
    unloadingInvoices: async(parent, { organization, dateStart, forwarder, all }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let workbook = new ExcelJS.Workbook();
            let dateEnd
            if(dateStart){
                dateStart = new Date(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            let data = []
            if(organization!=='super'){
                data = await InvoiceAzyk.find(
                    {
                        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                        del: {$ne: 'deleted'},
                        taken: true,
                        organization: organization
                    }
                )
                    .populate({
                        path: 'orders',
                        populate : [
                            {
                                path : 'item',
                            }
                        ]
                    })
                    .populate({
                        path : 'client'
                    })
                    .populate({
                        path : 'forwarder'
                    })
                    .populate({
                        path : 'agent'
                    })
                    .populate({
                        path : 'adss'
                    })
                    .lean()
            }
            if(all){
                let distributers = await DistributerAzyk.findOne({
                    distributer: organization==='super'?null:organization
                })
                let clients = await DistrictAzyk.find({
                    organization: organization==='super'?null:organization,
                }).distinct('client')
                if(distributers){
                    for(let i = 0; i<distributers.provider.length;i++) {
                        data = [...(await InvoiceAzyk.find(
                            {
                                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                                del: {$ne: 'deleted'},
                                taken: true,
                                organization: distributers.provider[i],
                                client: {$in: clients}
                            }
                        )
                            .populate({
                                path: 'orders',
                                populate : [
                                    {
                                        path : 'item',
                                    }
                                ]
                            })
                            .populate({
                                path : 'client'
                            })
                            .populate({
                                path : 'forwarder'
                            })
                            .populate({
                                path : 'agent'
                            })
                            .populate({
                                path : 'adss'
                            })
                            .lean()),
                            ...data
                        ]
                    }
                }
            }
            if(organization!=='super') {
                organization = await OrganizationAzyk.findOne({_id: organization})
            }
            else {
                organization = await ContactAzyk.findOne()
            }
            let worksheet;
            let auto
            let items = {}
            let allCount = 0
            let allPrice = 0
            let allTonnage = 0
            let allSize = 0
            for(let i = 0; i<data.length;i++){
                for(let i1 = 0; i1<data[i].orders.length;i1++) {
                    if(!items[data[i].orders[i1].item._id])
                        items[data[i].orders[i1].item._id] = {
                            name: data[i].orders[i1].item.name,
                            count: 0,
                            allPrice: 0,
                            packaging: data[i].orders[i1].item.packaging,
                            allTonnage: 0,
                            allSize: 0
                        }
                    items[data[i].orders[i1].item._id].count += data[i].orders[i1].count
                    items[data[i].orders[i1].item._id].allPrice += data[i].orders[i1].allPrice
                    items[data[i].orders[i1].item._id].allTonnage += data[i].orders[i1].allTonnage
                    items[data[i].orders[i1].item._id].allSize += data[i].orders[i1].allSize
                    allCount += data[i].orders[i1].count
                    allPrice += data[i].orders[i1].allPrice
                    allTonnage += data[i].orders[i1].allTonnage
                    allSize += data[i].orders[i1].allSize
                }
            }
            worksheet = await workbook.addWorksheet('Лист загрузки');
            let row = 1;
            worksheet.getColumn(1).width = 25;
            worksheet.getColumn(2).width = 15;
            worksheet.getColumn(3).width = 15;
            worksheet.getColumn(4).width = 15;
            worksheet.getColumn(5).width = 15;
            worksheet.getCell(`A${row}`).font = {bold: true};
            worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`A${row}`).value = 'Товар:';
            worksheet.getCell(`B${row}`).font = {bold: true};
            worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`B${row}`).value = 'Количество:';
            worksheet.getCell(`C${row}`).font = {bold: true};
            worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`C${row}`).value = 'Упаковок:';
            worksheet.getCell(`D${row}`).font = {bold: true};
            worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`D${row}`).value = 'Сумма:';
            if(allTonnage){
                worksheet.getCell(`E${row}`).font = {bold: true};
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = 'Тоннаж:';
            }
            if(allSize){
                worksheet.getCell(`${allTonnage?'F':'E'}${row}`).font = {bold: true};
                worksheet.getCell(`${allTonnage?'F':'E'}${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`${allTonnage?'F':'E'}${row}`).value = 'Кубатура:';
            }
            const keys = Object.keys(items)
            for(let i=0; i<keys.length; i++){
                row += 1;
                worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`A${row}`).alignment = { wrapText: true };
                worksheet.getCell(`A${row}`).value = items[keys[i]].name;
                worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).value = `${items[keys[i]].count} шт`;
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`C${row}`).value = `${checkFloat(items[keys[i]].count/(items[keys[i]].packaging?items[keys[i]].packaging:1))} уп`;
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).value = `${items[keys[i]].allPrice} сом`;
                if(allTonnage){
                    worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`E${row}`).value = `${items[keys[i]].allTonnage} кг`;
                }
                if(allSize){
                    worksheet.getCell(`${allTonnage?'F':'E'}${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`${allTonnage?'F':'E'}${row}`).value = `${items[keys[i]].allSize} см³`
                }
            }
            row += 1;
            worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`A${row}`).alignment = { wrapText: true };
            worksheet.getCell(`A${row}`).font = {bold: true};
            worksheet.getCell(`A${row}`).value = 'Итого';
            worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`B${row}`).value = `${allCount} шт`;
            worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`C${row}`).value = '';
            worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`D${row}`).value = `${allPrice} сом`;
            if(allTonnage){
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = `${allTonnage} кг`;
            }
            if(allSize){
                worksheet.getCell(`${allTonnage?'F':'E'}${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`${allTonnage?'F':'E'}${row}`).value = `${allSize} см³`
            }


            for(let i = 0; i<data.length;i++){
                worksheet = await workbook.addWorksheet(`Накладная ${data[i].number}`);
                worksheet.getColumn(1).width = 25;
                worksheet.getColumn(2).width = 15;
                worksheet.getColumn(3).width = 15;
                worksheet.getColumn(4).width = 15;
                worksheet.getColumn(5).width = 15;
                row = 1;
                let date = data[i].createdAt;
                date = date.setDate(date.getDate() + 1)
                worksheet.getCell(`A${row}`).font = {bold: true, size: 14};
                worksheet.getCell(`A${row}`).value = `Накладная №${data[i].number} от ${pdDDMMYYYY(date)}`;
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Продавец:';
                worksheet.getCell(`B${row}`).value = organization.name;
                if(organization.address&&organization.address.length>0) {
                    row += 1;
                    worksheet.getCell(`A${row}`).font = {bold: true};
                    worksheet.getCell(`A${row}`).value = 'Адрес продавца:';
                    worksheet.getCell(`B${row}`).value = `${organization.address.toString()}`;
                }
                if(organization.phone&&organization.phone.length>0){
                    row+=1;
                    worksheet.getCell(`A${row}`).font = {bold: true};
                    worksheet.getCell(`A${row}`).value = 'Телефон продавца:';
                    worksheet.getCell(`B${row}`).value = organization.phone.toString();
                }
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Получатель:';
                worksheet.getCell(`B${row}`).value = data[i].client.name;
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Адрес получателя:';
                worksheet.getCell(`B${row}`).value = `${data[i].address[2] ? `${data[i].address[2]}, ` : ''}${data[i].address[0]}`;
                for(let i1=0; i1<data[i].client.phone.length; i1++) {
                    row+=1;
                    if(!i1) {
                        worksheet.getCell(`A${row}`).font = {bold: true};
                        worksheet.getCell(`A${row}`).value = 'Телефон получателя:';
                    }
                    worksheet.getCell(`B${row}`).value = data[i].client.phone[i1];
                }
                if(forwarder){
                    let district = await DistrictAzyk.findOne({client: data[i].client._id, organization: forwarder!=='super'?forwarder:null}).populate('ecspeditor').lean()
                    data[i].forwarder = district?district.ecspeditor:null
                }
                if(data[i].forwarder){
                    row+=1;
                    worksheet.getCell(`A${row}`).font = {bold: true};
                    worksheet.getCell(`A${row}`).value = 'Экспедитор:';
                    worksheet.getCell(`B${row}`).value = data[i].forwarder.name;
                    if(data[i].forwarder.phone&&data[i].forwarder.phone.length>0) {
                        row+=1;
                        worksheet.getCell(`A${row}`).font = {bold: true};
                        worksheet.getCell(`A${row}`).value = 'Тел:';
                        worksheet.getCell(`B${row}`).value = data[i].forwarder.phone.toString()
                    }
                    auto = await AutoAzyk.findOne({employment: data[i].forwarder._id})
                    row+=1;
                    worksheet.getCell(`A${row}`).font = {bold: true};
                    worksheet.getCell(`A${row}`).value = '№ рейса:';
                    worksheet.getCell(`B${row}`).value = data[i].track.toString();
                    if(auto&&auto.number){
                        worksheet.getCell(`C${row}`).font = {bold: true};
                        worksheet.getCell(`C${row}`).value = '№ авто:';
                        worksheet.getCell(`D${row}`).value = auto.number;
                    }
                }
                if(data[i].adss) {
                    row+=1;
                    for(let i1=0; i1<data[i].adss.length; i1++) {
                        row+=1;
                        if(!i1) {
                            worksheet.getCell(`A${row}`).font = {bold: true};
                            worksheet.getCell(`A${row}`).value = 'Акция:';
                        }
                        worksheet.getCell(`B${row}`).value = data[i].adss[i1].title;
                    }
                    row+=1;
                }
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`A${row}`).value = 'Товар:';
                worksheet.getCell(`B${row}`).font = {bold: true};
                worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).value = 'Цена:';
                worksheet.getCell(`C${row}`).font = {bold: true};
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`C${row}`).value = 'Количество:';
                worksheet.getCell(`D${row}`).font = {bold: true};
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).value = 'Упаковок:';
                worksheet.getCell(`E${row}`).font = {bold: true};
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = 'Сумма:';
                if(data[i].consignmentPrice>0) {
                    worksheet.getCell(`F${row}`).font = {bold: true};
                    worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`F${row}`).value = 'Консигнации:';
                }
                for(let i1=0; i1<data[i].orders.length; i1++) {
                    row += 1;
                    worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`A${row}`).alignment = { wrapText: true };
                    worksheet.getCell(`A${row}`).value = data[i].orders[i1].item.name;
                    worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`B${row}`).value = `${data[i].orders[i1].item.stock?data[i].orders[i1].item.stock:data[i].orders[i1].item.price} сом`;
                    worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`C${row}`).value = `${data[i].orders[i1].count} шт`;
                    worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`D${row}`).value = `${checkFloat(data[i].orders[[i1]].count/(data[i].orders[[i1]].packaging?data[i].orders[[i1]].packaging:1))} уп`;
                    worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`E${row}`).value = `${data[i].orders[[i1]].allPrice} сом`;
                    if(data[i].orders[[i1]].consignmentPrice>0) {
                        worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                        worksheet.getCell(`F${row}`).value = `${data[i].orders[[i1]].consignmentPrice} сом`;
                    }
                }

                row+=1;
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`C${row}`).font = {bold: true};
                worksheet.getCell(`C${row}`).value = 'Сумма:';
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).value = `${data[i].allPrice} сом`;
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Отпустил:';
                worksheet.getCell(`B${row}`).border = {bottom: {style:'thin'}};
                worksheet.getCell(`C${row}`).border = {bottom: {style:'thin'}};
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Получил:';
                worksheet.getCell(`B${row}`).border = {bottom: {style:'thin'}};
                worksheet.getCell(`C${row}`).border = {bottom: {style:'thin'}};
            }
            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return({data: urlMain + '/xlsx/' + xlsxname})
        }
    },
    unloadingAdsOrders: async(parent, { organization, dateStart }, {user}) => {
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let workbook = new ExcelJS.Workbook();
            dateStart = new Date(dateStart)
            dateStart.setHours(3, 0, 0, 0)
            if(user.organization)
                organization = user.organization
            let districts = await DistrictAzyk.find({
                organization: organization
            }).lean()
            for(let x=0;x<districts.length;x++) {
                let data = await InvoiceAzyk.find(
                    {
                        dateDelivery: dateStart,
                        del: {$ne: 'deleted'},
                        taken: true,
                        organization: organization,
                        adss: {$ne: []},
                        client: {$in: districts[x].client}
                    }
                )
                    .populate({
                        path: 'adss',
                        populate : [
                            {
                                path : 'item',
                            }
                        ]
                    })
                    .populate({
                        path : 'client'
                    })
                    .lean()
                if (data.length>0){
                    let worksheet;
                    worksheet = await workbook.addWorksheet(`Район ${districts[x].name}`);
                    worksheet.getColumn(1).width = 30;
                    worksheet.getColumn(2).width = 20;
                    worksheet.getColumn(3).width = 15;
                    worksheet.getColumn(4).width = 15;
                    worksheet.getColumn(5).width = 15;
                    let row = 1;
                    for(let i = 0; i<data.length;i++){
                        if(i!==0) {
                            row += 2;
                        }
                        worksheet.getCell(`A${row}`).font = {bold: true, size: 14};
                        worksheet.getCell(`A${row}`).value = `Акция${i+1}`;
                        row += 1;
                        worksheet.getCell(`A${row}`).font = {bold: true};
                        worksheet.getCell(`A${row}`).value = 'Клиент:';
                        worksheet.getCell(`B${row}`).value = data[i].client.name;
                        row+=1;
                        worksheet.getCell(`A${row}`).font = {bold: true};
                        worksheet.getCell(`A${row}`).value = 'Адрес:';
                        worksheet.getCell(`B${row}`).value = `${data[i].address[2] ? `${data[i].address[2]}, ` : ''}${data[i].address[0]}`;
                        for(let i1=0; i1<data[i].client.phone.length; i1++) {
                            row+=1;
                            if(!i1) {
                                worksheet.getCell(`A${row}`).font = {bold: true};
                                worksheet.getCell(`A${row}`).value = 'Телефон:';
                            }
                            worksheet.getCell(`B${row}`).value = data[i].client.phone[i1];
                        }
                        row+=1;
                        for(let i1=0; i1<data[i].adss.length; i1++) {
                            worksheet.getCell(`A${row}`).font = {bold: true};
                            worksheet.getCell(`A${row}`).value = 'Акция:';
                            worksheet.getCell(`B${row}`).value = `${data[i].adss[i1].title}`;
                            row+=1;
                            if(data[i].adss[i1].item){
                                worksheet.getCell(`A${row}`).font = {bold: true};
                                worksheet.getCell(`A${row}`).value = 'Товар:';
                                worksheet.getCell(`B${row}`).value = `${data[i].adss[i1].item.name}`;
                                row+=1;
                                worksheet.getCell(`A${row}`).font = {bold: true};
                                worksheet.getCell(`A${row}`).value = 'Количество:';
                                worksheet.getCell(`B${row}`).value = `${data[i].adss[i1].count}`;
                                row+=1;
                                worksheet.getCell(`A${row}`).font = {bold: true};
                                worksheet.getCell(`A${row}`).value = 'Упаковок:';
                                worksheet.getCell(`B${row}`).value = `${data[i].adss[i1].count/(data[i].adss[i1].item.packaging ? data[i].adss[i1].item.packaging : 1)}`;
                                row+=1;
                            }
                        }
                    }
                }

            }

            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return({data: urlMain + '/xlsx/' + xlsxname})
        }
    },
    unloadingClients: async(parent, { organization }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let workbook = new ExcelJS.Workbook();
            let data = await ClientAzyk.find(
                {
                    ...{del: {$ne: 'deleted'}}
                }
            ).lean()
            data = data.filter(data =>{
                return(data.name.length>0&&data.address[0]&&!(data.name.toLowerCase()).includes('агент')&&!(data.name.toLowerCase()).includes('agent'))
            })
            let worksheet;
            worksheet = await workbook.addWorksheet('Клиенты');
            worksheet.getColumn(1).width = 30;
            worksheet.getCell('A1').font = {bold: true, size: 14};
            worksheet.getCell('A1').value = 'ID';
            worksheet.getColumn(2).width = 30;
            worksheet.getCell('B1').font = {bold: true, size: 14};
            worksheet.getCell('B1').value = 'GUID';
            worksheet.getColumn(3).width = 30;
            worksheet.getCell('C1').font = {bold: true, size: 14};
            worksheet.getCell('C1').value = 'Магазин';
            worksheet.getColumn(4).width = 30;
            worksheet.getCell('D1').font = {bold: true, size: 14};
            worksheet.getCell('D1').value = 'Адрес';
            worksheet.getColumn(5).width = 30;
            worksheet.getCell('E1').font = {bold: true, size: 14};
            worksheet.getCell('E1').value = 'Телефон';
            for(let i = 0; i<data.length;i++){
                let GUID = ''
                let findGUID = await Integrate1CAzyk.findOne({
                    ...(organization==='super'?{organization: null}:{organization: organization}),
                    client: data[i]._id})
                if(findGUID)
                    GUID = findGUID.guid
                worksheet.addRow([
                    data[i]._id.toString(),
                    GUID,
                    data[i].address[0][2],
                    data[i].address[0][0],
                    data[i].phone.reduce((accumulator, currentValue, index) => accumulator + `${index!==0?', ':''}${currentValue}`, '')
                ]);
            }

            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return({data: urlMain + '/xlsx/' + xlsxname})
        }
    },
    unloadingEmployments: async(parent, { organization }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let workbook = new ExcelJS.Workbook();
            let data = await EmploymentAzyk.find(
                {
                    ...(organization==='super'?{organization: null}:{organization: organization}),
                    ...{del: {$ne: 'deleted'}}
                }
            ).populate('user').lean()
            let worksheet;
            worksheet = await workbook.addWorksheet('Сотрудники');
            worksheet.getColumn(1).width = 30;
            worksheet.getCell('A1').font = {bold: true, size: 14};
            worksheet.getCell('A1').value = 'ID';
            worksheet.getColumn(2).width = 30;
            worksheet.getCell('B1').font = {bold: true, size: 14};
            worksheet.getCell('B1').value = 'GUID';
            worksheet.getColumn(3).width = 30;
            worksheet.getCell('C1').font = {bold: true, size: 14};
            worksheet.getCell('C1').value = 'Имя';
            worksheet.getColumn(4).width = 30;
            worksheet.getCell('C1').font = {bold: true, size: 14};
            worksheet.getCell('C1').value = 'Роль';
            worksheet.getColumn(4).width = 30;
            worksheet.getCell('E1').font = {bold: true, size: 14};
            worksheet.getCell('E1').value = 'Телефон';
            for(let i = 0; i<data.length;i++){
                let GUID = ''
                let findGUID = await Integrate1CAzyk.findOne({
                    ...(organization==='super'?{organization: null}:{organization: organization}),
                    $or: [
                        {agent: data[i]._id},
                        {ecspeditor: data[i]._id},
                        {manager: data[i]._id},
                    ]
                })
                if(findGUID)
                    GUID = findGUID.guid
                worksheet.addRow([
                    data[i]._id.toString(),
                    GUID,
                    data[i].name,
                    data[i].user.role,
                    data[i].phone.reduce((accumulator, currentValue, index) => accumulator + `${index!==0?', ':''}${currentValue}`, '')
                ]);
            }

            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return({data: urlMain + '/xlsx/' + xlsxname})
        }
    },
    unloadingDistricts: async(parent, { organization }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let workbook = new ExcelJS.Workbook();
            let data = await DistrictAzyk.find(
                {
                    ...(organization==='super'?{organization: null}:{organization: organization})
                }
            ).populate('client').lean()
            let worksheet;
            for(let i = 0; i<data.length;i++){
                worksheet = await workbook.addWorksheet(data[i].name);
                worksheet.getColumn(1).width = 30;
                worksheet.getCell('A1').font = {bold: true, size: 14};
                worksheet.getCell('A1').value = 'ID';
                worksheet.getColumn(2).width = 30;
                worksheet.getCell('B1').font = {bold: true, size: 14};
                worksheet.getCell('B1').value = 'GUID';
                worksheet.getColumn(3).width = 30;
                worksheet.getCell('C1').font = {bold: true, size: 14};
                worksheet.getCell('C1').value = 'Магазин';
                worksheet.getColumn(4).width = 30;
                worksheet.getCell('D1').font = {bold: true, size: 14};
                worksheet.getCell('D1').value = 'Адрес';
                worksheet.getColumn(5).width = 30;
                worksheet.getCell('E1').font = {bold: true, size: 14};
                worksheet.getCell('E1').value = 'Телефон';

                for(let i1 = 0; i1<data[i].client.length;i1++){
                    let GUID = ''
                    let findGUID = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        client: data[i].client[i1]._id})
                    if(findGUID)
                        GUID = findGUID.guid
                    worksheet.addRow([
                        data[i].client[i1]._id.toString(),
                        GUID,
                        data[i].client[i1].address[0][2],
                        data[i].client[i1].address[0][0],
                        data[i].client[i1].phone.reduce((accumulator, currentValue, index) => accumulator + `${index!==0?', ':''}${currentValue}`, '')
                    ]);
                }
            }

            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return({data: urlMain + '/xlsx/' + xlsxname})
        }
    },
    unloadingAgentRoutes: async(parent, { organization }, {user}) => {
        if(['admin', 'суперорганизация'].includes(user.role)){
            organization = user.organization?user.organization:organization
            let workbook = new ExcelJS.Workbook();
            let data = await AgentRouteAzyk.find(
                {
                    ...(organization==='super'?{organization: null}:{organization: organization})
                }
            ).lean()
            let worksheet;
            for(let i = 0; i<data.length;i++){
                worksheet = await workbook.addWorksheet(data[i].name);
                worksheet.getColumn(1).width = 30;
                worksheet.getCell('A1').font = {bold: true, size: 14};
                worksheet.getCell('A1').value = 'ID';
                worksheet.getColumn(2).width = 30;
                worksheet.getCell('B1').font = {bold: true, size: 14};
                worksheet.getCell('B1').value = 'GUID';
                worksheet.getColumn(3).width = 30;
                worksheet.getCell('C1').font = {bold: true, size: 14};
                worksheet.getCell('C1').value = 'Магазин';
                worksheet.getColumn(5).width = 30;
                worksheet.getCell('E1').font = {bold: true, size: 14};
                worksheet.getCell('E1').value = 'ID';
                worksheet.getColumn(6).width = 30;
                worksheet.getCell('F1').font = {bold: true, size: 14};
                worksheet.getCell('F1').value = 'GUID';
                worksheet.getColumn(7).width = 30;
                worksheet.getCell('G1').font = {bold: true, size: 14};
                worksheet.getCell('G1').value = 'Магазин';
                worksheet.getColumn(9).width = 30;
                worksheet.getCell('I1').font = {bold: true, size: 14};
                worksheet.getCell('I1').value = 'ID';
                worksheet.getColumn(10).width = 30;
                worksheet.getCell('J1').font = {bold: true, size: 14};
                worksheet.getCell('J1').value = 'GUID';
                worksheet.getColumn(11).width = 30;
                worksheet.getCell('K1').font = {bold: true, size: 14};
                worksheet.getCell('K1').value = 'Магазин';
                worksheet.getColumn(13).width = 30;
                worksheet.getCell('M1').font = {bold: true, size: 14};
                worksheet.getCell('M1').value = 'ID';
                worksheet.getColumn(14).width = 30;
                worksheet.getCell('N1').font = {bold: true, size: 14};
                worksheet.getCell('N1').value = 'GUID';
                worksheet.getColumn(15).width = 30;
                worksheet.getCell('O1').font = {bold: true, size: 14};
                worksheet.getCell('O1').value = 'Магазин';
                worksheet.getColumn(17).width = 30;
                worksheet.getCell('Q1').font = {bold: true, size: 14};
                worksheet.getCell('Q1').value = 'ID';
                worksheet.getColumn(18).width = 30;
                worksheet.getCell('R1').font = {bold: true, size: 14};
                worksheet.getCell('R1').value = 'GUID';
                worksheet.getColumn(19).width = 30;
                worksheet.getCell('S1').font = {bold: true, size: 14};
                worksheet.getCell('S1').value = 'Магазин';
                worksheet.getColumn(21).width = 30;
                worksheet.getCell('U1').font = {bold: true, size: 14};
                worksheet.getCell('U1').value = 'ID';
                worksheet.getColumn(22).width = 30;
                worksheet.getCell('V1').font = {bold: true, size: 14};
                worksheet.getCell('V1').value = 'GUID';
                worksheet.getColumn(23).width = 30;
                worksheet.getCell('W1').font = {bold: true, size: 14};
                worksheet.getCell('W1').value = 'Магазин';
                worksheet.getColumn(25).width = 30;
                worksheet.getCell('Y1').font = {bold: true, size: 14};
                worksheet.getCell('Y1').value = 'ID';
                worksheet.getColumn(26).width = 30;
                worksheet.getCell('Z1').font = {bold: true, size: 14};
                worksheet.getCell('Z1').value = 'GUID';
                worksheet.getColumn(27).width = 30;
                worksheet.getCell('AA1').font = {bold: true, size: 14};
                worksheet.getCell('AA1').value = 'Магазин';
                for(let i1 = 0; i1<data[i].clients[0].length;i1++) {
                    let GUID = ''
                    let findGUID = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        client: data[i].clients[0][i1]}).populate('client')
                    worksheet.getCell(`A${i1 + 2}`).value = data[i].clients[0][i1].toString();
                    if(findGUID) {
                        GUID = findGUID.guid
                        worksheet.getCell(`B${i1 + 2}`).value = GUID;
                        worksheet.getCell(`C${i1 + 2}`).value = findGUID.client.address[0][2];
                    }
                }
                for(let i1 = 0; i1<data[i].clients[1].length;i1++) {
                    let GUID = ''
                    let findGUID = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        client: data[i].clients[1][i1]}).populate('client')
                    worksheet.getCell(`E${i1 + 2}`).value = data[i].clients[1][i1].toString();
                    if(findGUID) {
                        GUID = findGUID.guid
                        worksheet.getCell(`F${i1 + 2}`).value = GUID;
                        worksheet.getCell(`G${i1 + 2}`).value = findGUID.client.address[0][2];
                    }
                }
                for(let i1 = 0; i1<data[i].clients[2].length;i1++) {
                    let GUID = ''
                    let findGUID = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        client: data[i].clients[2][i1]}).populate('client')
                    worksheet.getCell(`I${i1 + 2}`).value = data[i].clients[2][i1].toString();
                    if(findGUID) {
                        GUID = findGUID.guid
                        worksheet.getCell(`J${i1 + 2}`).value = GUID;
                        worksheet.getCell(`K${i1 + 2}`).value = findGUID.client.address[0][2];
                    }
                }
                for(let i1 = 0; i1<data[i].clients[3].length;i1++) {
                    let GUID = ''
                    let findGUID = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        client: data[i].clients[3][i1]}).populate('client')
                    worksheet.getCell(`M${i1 + 2}`).value = data[i].clients[3][i1].toString();
                    if(findGUID) {
                        GUID = findGUID.guid
                        worksheet.getCell(`N${i1 + 2}`).value = GUID;
                        worksheet.getCell(`O${i1 + 2}`).value = findGUID.client.address[0][2];
                    }
                }
                for(let i1 = 0; i1<data[i].clients[4].length;i1++) {
                    let GUID = ''
                    let findGUID = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        client: data[i].clients[4][i1]}).populate('client')
                    worksheet.getCell(`Q${i1 + 2}`).value = data[i].clients[4][i1].toString();
                    if(findGUID) {
                        GUID = findGUID.guid
                        worksheet.getCell(`Q${i1 + 2}`).value = findGUID.client._id;
                        worksheet.getCell(`R${i1 + 2}`).value = GUID;
                        worksheet.getCell(`S${i1 + 2}`).value = findGUID.client.address[0][2];
                    }
                }
                for(let i1 = 0; i1<data[i].clients[5].length;i1++) {
                    let GUID = ''
                    let findGUID = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        client: data[i].clients[5][i1]}).populate('client')
                    worksheet.getCell(`U${i1 + 2}`).value = data[i].clients[5][i1].toString();
                    if(findGUID) {
                        GUID = findGUID.guid
                        worksheet.getCell(`V${i1 + 2}`).value = GUID;
                        worksheet.getCell(`W${i1 + 2}`).value = findGUID.client.address[0][2];
                    }
                }
                for(let i1 = 0; i1<data[i].clients[6].length;i1++) {
                    let GUID = ''
                    let findGUID = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        client: data[i].clients[6][i1]}).populate('client')
                    worksheet.getCell(`Y${i1 + 2}`).value = data[i].clients[6][i1].toString();
                    if(findGUID) {
                        GUID = findGUID.guid
                        worksheet.getCell(`Z${i1 + 2}`).value = GUID;
                        worksheet.getCell(`AA${i1 + 2}`).value = findGUID.client.address[0][2];
                    }
                }
            }

            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return({data: urlMain + '/xlsx/' + xlsxname})
        }
    },
};

const resolversMutation = {
    uploadingClients: async(parent, { document, organization }, {user}) => {
        if (user.role === 'admin') {
            let {stream, filename} = await document;
            filename = await saveFile(stream, filename);
            let xlsxpath = path.join(app.dirname, 'public', filename);
            let rows = await readXlsxFile(xlsxpath)
            for (let i = 0; i < rows.length; i++) {
                let integrate1CAzyk = await Integrate1CAzyk.findOne({
                    organization: organization,
                    guid: rows[i][0]
                })
                if(!integrate1CAzyk) {
                    let client = new UserAzyk({
                        login: randomstring.generate(20),
                        role: 'client',
                        status: 'deactive',
                        password: '12345678',
                    });
                    client = await UserAzyk.create(client);
                    client = new ClientAzyk({
                        name: rows[i][1],
                        phone: [''],
                        city: rows[i][2]?rows[i][2]:'',
                        address: [[rows[i][3], '', rows[i][1]]],
                        user: client._id,
                        notification: false
                    });
                    client = await ClientAzyk.create(client);
                    let _object = new Integrate1CAzyk({
                        item: null,
                        client: client._id,
                        agent: null,
                        ecspeditor: null,
                        organization: organization,
                        guid: rows[i][0],
                    });
                    await Integrate1CAzyk.create(_object)
                }
            }
            await deleteFile(filename)
            return ({data: 'OK'})
        }
    },
    uploadingAgentRoute: async(parent, { document, agentRoute }, {user}) => {
        if (user.role === 'admin') {
            let {stream, filename} = await document;
            filename = await saveFile(stream, filename);
            let xlsxpath = path.join(app.dirname, 'public', filename);
            let rows = await readXlsxFile(xlsxpath)
            agentRoute = await AgentRouteAzyk.findOne({_id: agentRoute})
            let integrate1CAzyk
            if(agentRoute){
                agentRoute.clients = [[],[],[],[],[],[],[]]
                for (let i = 0; i < rows.length; i++) {
                    if(rows[i][0]&&rows[i][0].length>0){
                        integrate1CAzyk = await Integrate1CAzyk.findOne({
                            organization: agentRoute.organization,
                            guid: rows[i][0]
                        })
                        if (integrate1CAzyk && integrate1CAzyk.client) {
                            agentRoute.clients[0].push(integrate1CAzyk.client)
                        }
                    }
                    if(rows[i][1]&&rows[i][1].length>0){
                        integrate1CAzyk = await Integrate1CAzyk.findOne({
                            organization: agentRoute.organization,
                            guid: rows[i][1]
                        })
                        if (integrate1CAzyk && integrate1CAzyk.client) {
                            agentRoute.clients[1].push(integrate1CAzyk.client)
                        }
                    }
                    if(rows[i][2]&&rows[i][2].length>0){
                        integrate1CAzyk = await Integrate1CAzyk.findOne({
                            organization: agentRoute.organization,
                            guid: rows[i][2]
                        })
                        if (integrate1CAzyk && integrate1CAzyk.client) {
                            agentRoute.clients[2].push(integrate1CAzyk.client)
                        }
                    }
                    if(rows[i][3]&&rows[i][3].length>0){
                        integrate1CAzyk = await Integrate1CAzyk.findOne({
                            organization: agentRoute.organization,
                            guid: rows[i][3]
                        })
                        if (integrate1CAzyk && integrate1CAzyk.client) {
                            agentRoute.clients[3].push(integrate1CAzyk.client)
                        }
                    }
                    if(rows[i][4]&&rows[i][4].length>0){
                        integrate1CAzyk = await Integrate1CAzyk.findOne({
                            organization: agentRoute.organization,
                            guid: rows[i][4]
                        })
                        if (integrate1CAzyk && integrate1CAzyk.client) {
                            agentRoute.clients[4].push(integrate1CAzyk.client)
                        }
                    }
                    if(rows[i][5]&&rows[i][5].length>0){
                        integrate1CAzyk = await Integrate1CAzyk.findOne({
                            organization: agentRoute.organization,
                            guid: rows[i][5]
                        })
                        if (integrate1CAzyk && integrate1CAzyk.client) {
                            agentRoute.clients[5].push(integrate1CAzyk.client)
                        }
                    }
                    if(rows[i][6]&&rows[i][6].length>0){
                        integrate1CAzyk = await Integrate1CAzyk.findOne({
                            organization: agentRoute.organization,
                            guid: rows[i][6]
                        })
                        if (integrate1CAzyk && integrate1CAzyk.client) {
                            agentRoute.clients[6].push(integrate1CAzyk.client)
                        }
                    }
                }
                await agentRoute.save()
            }
            await deleteFile(filename)
            return ({data: 'OK'})
        }
    },
    uploadingDistricts: async(parent, { document, organization }, {user}) => {
        if (user.role === 'admin') {
            let {stream, filename} = await document;
            filename = await saveFile(stream, filename);
            let xlsxpath = path.join(app.dirname, 'public', filename);
            let rows = await readXlsxFile(xlsxpath)
            let districts = {}
            let findEmployments = {}
            let integrate1CAzyk
            for (let i = 0; i < rows.length; i++) {
                if(!findEmployments[rows[i][0]]||!districts[findEmployments[rows[i][0]]]){
                    integrate1CAzyk = await Integrate1CAzyk.findOne({
                        ...(organization==='super'?{organization: null}:{organization: organization}),
                        guid: rows[i][0]
                    })
                    if (integrate1CAzyk && integrate1CAzyk.agent) {
                        findEmployments[rows[i][0]] = integrate1CAzyk.agent
                        districts[findEmployments[rows[i][0]]] = []
                    }
                }
                if(findEmployments[rows[i][0]]&&districts[findEmployments[rows[i][0]]]) {
                    districts[findEmployments[rows[i][0]]].push(rows[i][1])

                }
            }
            const keys1 = Object.keys(districts);
            let district;
            for (let i = 0; i < keys1.length; i++) {
                district = await DistrictAzyk.findOne({
                    ...(organization==='super'?{organization: null}:{organization: organization}),
                    agent: keys1[i]
                })
                if(district) {
                    district.client = []
                    for (let i1 = 0; i1 < districts[keys1[i]].length; i1++) {
                        integrate1CAzyk = await Integrate1CAzyk.findOne({
                            ...(organization==='super'?{organization: null}:{organization: organization}),
                            guid: districts[keys1[i]][i1]
                        })
                        if (integrate1CAzyk && integrate1CAzyk.client) {
                            district.client.push(integrate1CAzyk.client)
                        }
                    }
                    await district.save()
                }
            }
            await deleteFile(filename)
            return ({data: 'OK'})
        }
    }
}

module.exports.type = type;
module.exports.query = query;
module.exports.mutation = mutation;
module.exports.resolversMutation = resolversMutation;
module.exports.resolvers = resolvers;