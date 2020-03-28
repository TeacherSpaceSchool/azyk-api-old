const ClientAzyk = require('../models/clientAzyk');
const UserAzyk = require('../models/userAzyk');
const OrderAzyk = require('../models/orderAzyk');
const ItemAzyk = require('../models/itemAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const { deleteFile, urlMain, saveImage } = require('../module/const');
const { createJwtGQL } = require('../module/passport');
const mongoose = require('mongoose')

const type = `
  type Client {
    _id: ID
    image: String
    name: String
    createdAt: Date
    lastActive: Date
    email: String
    city: String
    address: [[String]]
    phone: [String]
    info: String
    reiting: Int
    user: Status
    device: String
    organization: Organization
    notification: Boolean
  }
`;

const query = `
    clientsSimpleStatistic(search: String!, filter: String!, date: String): [String]
    clients(search: String!, sort: String!, filter: String!, date: String, skip: Int): [Client]
    client(_id: ID!): Client
    sortClient: [Sort]
    filterClient: [Filter]
`;

const mutation = `
    addClient(image: Upload, name: String!, email: String, city: String!, address: [[String]]!, phone: [String]!, info: String, password: String!, login: String!): Data
    setClient(_id: ID!, device: String, image: Upload, name: String, city: String, phone: [String], login: String, email: String, address: [[String]], info: String, newPass: String): Data
    deleteClient(_id: [ID]!): Data
    onoffClient(_id: [ID]!): Data
`;

const resolvers = {
    clientsSimpleStatistic: async(parent, {search, date}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date&&date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        if(user.role==='admin'){
            let clients = await ClientAzyk
                .aggregate(
                    [
                        {
                            $match:{
                                ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                del: {$ne: 'deleted'},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {city: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {device: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                    {phone: {'$regex': search, '$options': 'i'}}
                                ]
                            }
                        },
                        {
                            $count :  'clientCount'
                        }
                    ])
            return [clients[0]?clients[0].clientCount.toString():'0']
        }
        else if(user.role==='суперагент'){
            if(search.length>2) {
                let clients = await ClientAzyk
                    .count({
                        ...(!date || date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                        del: {$ne: 'deleted'},
                        $or: [
                            {name: {'$regex': search, '$options': 'i'}},
                            {email: {'$regex': search, '$options': 'i'}},
                            {city: {'$regex': search, '$options': 'i'}},
                            {info: {'$regex': search, '$options': 'i'}},
                            {device: {'$regex': search, '$options': 'i'}},
                            {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                            {phone: {'$regex': search, '$options': 'i'}}
                        ]
                    })
                return [clients.toString()]
            } else return ['0']
        }
        else if('агент'===user.role) {
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            clients = await ClientAzyk
                .aggregate(
                    [
                        {
                            $match:{
                                ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                del: {$ne: 'deleted'},
                                _id: {$in: clients},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {city: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {device: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                    {phone: {'$regex': search, '$options': 'i'}}
                                ]
                            }
                        },
                        { $lookup:
                            {
                                from: UserAzyk.collection.collectionName,
                                let: { user: '$user' },
                                pipeline: [
                                    { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                ],
                                as: 'user'
                            }
                        },
                        {
                            $unwind:{
                                preserveNullAndEmptyArrays : true, // this remove the object which is null
                                path : '$user'
                            }
                        },
                        {
                            $match:{
                                'user.status': 'active'
                            }
                        },
                    ])
            return [(clients.length).toString()]
        }
        else if('менеджер'===user.role) {
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            clients = await ClientAzyk
                .aggregate(
                    [
                        {
                            $match:{
                                ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                del: {$ne: 'deleted'},
                                _id: {$in: clients},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {city: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {device: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                    {phone: {'$regex': search, '$options': 'i'}}
                                ]
                            }
                        },
                        { $lookup:
                            {
                                from: UserAzyk.collection.collectionName,
                                let: { user: '$user' },
                                pipeline: [
                                    { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                ],
                                as: 'user'
                            }
                        },
                        {
                            $unwind:{
                                preserveNullAndEmptyArrays : true, // this remove the object which is null
                                path : '$user'
                            }
                        },
                        {
                            $match:{
                                'user.status': 'active'
                            }
                        },
                    ])
            return [(clients.length).toString()]
        } else if(['организация'].includes(user.role)) {
            let organization = await OrganizationAzyk.findOne({_id: user.organization})
            let clients;
            if(organization.accessToClient){
                clients = await ClientAzyk
                    .aggregate(
                        [
                            {
                                $match:{
                                    ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                    del: {$ne: 'deleted'},
                                    $or: [
                                        {name: {'$regex': search, '$options': 'i'}},
                                        {email: {'$regex': search, '$options': 'i'}},
                                        {city: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {device: {'$regex': search, '$options': 'i'}},
                                        {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                        {phone: {'$regex': search, '$options': 'i'}}
                                    ]
                                }
                            },
                            { $lookup:
                                {
                                    from: UserAzyk.collection.collectionName,
                                    let: { user: '$user' },
                                    pipeline: [
                                        { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                    ],
                                    as: 'user'
                                }
                            },
                            {
                                $unwind:{
                                    preserveNullAndEmptyArrays : true, // this remove the object which is null
                                    path : '$user'
                                }
                            },
                            {
                                $match:{
                                    'user.status': 'active'
                                }
                            }])
                clients = clients.length
            }
            else {
                let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
                clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
                clients = await ClientAzyk
                    .aggregate(
                        [
                            {
                                $match:{
                                    ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                    del: {$ne: 'deleted'},
                                    _id: {$in: clients},
                                    $or: [
                                        {name: {'$regex': search, '$options': 'i'}},
                                        {email: {'$regex': search, '$options': 'i'}},
                                        {city: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {device: {'$regex': search, '$options': 'i'}},
                                        {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                        {phone: {'$regex': search, '$options': 'i'}}
                                    ]
                                }
                            },
                            { $lookup:
                                {
                                    from: UserAzyk.collection.collectionName,
                                    let: { user: '$user' },
                                    pipeline: [
                                        { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                    ],
                                    as: 'user'
                                }
                            },
                            {
                                $unwind:{
                                    preserveNullAndEmptyArrays : true, // this remove the object which is null
                                    path : '$user'
                                }
                            },
                            {
                                $match:{
                                    'user.status': 'active'
                                }
                            }])
                clients = clients.length
            }
            return [clients.toString()]
        }
    },
    clients: async(parent, {search, sort, date, skip}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date&&date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        let _sort = {}
        _sort[sort[0]==='-'?sort.substring(1):sort]=sort[0]==='-'?-1:1
        if(user.role==='admin'){
            let clients = await ClientAzyk
                .aggregate(
                    [
                        {
                            $match:{
                                ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                del: {$ne: 'deleted'},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {city: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {device: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                    {phone: {'$regex': search, '$options': 'i'}}
                                ]
                            }
                        },
                        { $sort : _sort },
                        { $skip : skip!=undefined?skip:0 },
                        { $limit : skip!=undefined?15:10000000000 },
                        { $lookup:
                            {
                                from: UserAzyk.collection.collectionName,
                                let: { user: '$user' },
                                pipeline: [
                                    { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                ],
                                as: 'user'
                            }
                        },
                        {
                            $unwind:{
                                preserveNullAndEmptyArrays : true, // this remove the object which is null
                                path : '$user'
                            }
                        }
                    ])
            return clients
        }
        else if(user.role==='суперагент'){
            if(search.length>2) {
                let clients = await ClientAzyk
                    .find({
                        ...(!date || date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                        del: {$ne: 'deleted'},
                        $or: [
                            {name: {'$regex': search, '$options': 'i'}},
                            {email: {'$regex': search, '$options': 'i'}},
                            {city: {'$regex': search, '$options': 'i'}},
                            {info: {'$regex': search, '$options': 'i'}},
                            {device: {'$regex': search, '$options': 'i'}},
                            {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                            {phone: {'$regex': search, '$options': 'i'}}
                        ]
                    })
                    .populate({
                        path: 'user'
                    })
                    .sort(sort)
                    .skip(skip!=undefined?skip:0)
                    .limit(skip!=undefined?15:10000000000)
                return clients
            } else return []
        }
        else if('агент'===user.role) {
            if(skip != undefined||search.length>2) {
                let clients = await DistrictAzyk
                    .find({agent: user.employment})
                    .distinct('client')
                clients = await ClientAzyk
                    .aggregate(
                        [
                            {
                                $match:{
                                    ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                    del: {$ne: 'deleted'},
                                    _id: {$in: clients},
                                    $or: [
                                        {name: {'$regex': search, '$options': 'i'}},
                                        {email: {'$regex': search, '$options': 'i'}},
                                        {city: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {device: {'$regex': search, '$options': 'i'}},
                                        {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                        {phone: {'$regex': search, '$options': 'i'}}
                                    ]
                                }
                            },
                            { $lookup:
                                {
                                    from: UserAzyk.collection.collectionName,
                                    let: { user: '$user' },
                                    pipeline: [
                                        { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                    ],
                                    as: 'user'
                                }
                            },
                            {
                                $unwind:{
                                    preserveNullAndEmptyArrays : true, // this remove the object which is null
                                    path : '$user'
                                }
                            },
                            {
                                $match:{
                                    'user.status': 'active'
                                }
                            },
                            { $sort : _sort },
                            { $skip : skip },
                            { $limit : 15 },
                        ])
                return clients
            }
            else return []
        }
        else if('менеджер'===user.role) {
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            clients = await ClientAzyk
                .aggregate(
                    [
                        {
                            $match:{
                                ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                del: {$ne: 'deleted'},
                                _id: {$in: clients},
                                $or: [
                                    {name: {'$regex': search, '$options': 'i'}},
                                    {email: {'$regex': search, '$options': 'i'}},
                                    {city: {'$regex': search, '$options': 'i'}},
                                    {info: {'$regex': search, '$options': 'i'}},
                                    {device: {'$regex': search, '$options': 'i'}},
                                    {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                    {phone: {'$regex': search, '$options': 'i'}}
                                ]
                            }
                        },
                        { $lookup:
                            {
                                from: UserAzyk.collection.collectionName,
                                let: { user: '$user' },
                                pipeline: [
                                    { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                ],
                                as: 'user'
                            }
                        },
                        {
                            $unwind:{
                                preserveNullAndEmptyArrays : true, // this remove the object which is null
                                path : '$user'
                            }
                        },
                        {
                            $match:{
                                'user.status': 'active'
                            }
                        },
                        { $sort : _sort },
                        { $skip : skip!=undefined?skip:0 },
                        { $limit : skip!=undefined?15:10000000000 },
                    ])
            return clients
        }
        else if(['организация'].includes(user.role)) {
            let organization = await OrganizationAzyk.findOne({_id: user.organization})
            let clients;
            if(organization.accessToClient)
                clients = await ClientAzyk
                    .aggregate(
                        [
                            {
                                $match:{
                                    ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                    del: {$ne: 'deleted'},
                                    $or: [
                                        {name: {'$regex': search, '$options': 'i'}},
                                        {email: {'$regex': search, '$options': 'i'}},
                                        {city: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {device: {'$regex': search, '$options': 'i'}},
                                        {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                        {phone: {'$regex': search, '$options': 'i'}}
                                    ]
                                }
                            },
                            { $lookup:
                                {
                                    from: UserAzyk.collection.collectionName,
                                    let: { user: '$user' },
                                    pipeline: [
                                        { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                    ],
                                    as: 'user'
                                }
                            },
                            {
                                $unwind:{
                                    preserveNullAndEmptyArrays : true, // this remove the object which is null
                                    path : '$user'
                                }
                            },
                            {
                                $match:{
                                    'user.status': 'active'
                                }
                            },
                            { $sort : _sort },
                            { $skip : skip!=undefined?skip:0 },
                            { $limit : skip!=undefined?15:10000000000 },
                        ])
            else {
                let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
                clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
                clients = await ClientAzyk
                    .aggregate(
                        [
                            {
                                $match:{
                                    ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                                    del: {$ne: 'deleted'},
                                    _id: {$in: clients},
                                    $or: [
                                        {name: {'$regex': search, '$options': 'i'}},
                                        {email: {'$regex': search, '$options': 'i'}},
                                        {city: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {device: {'$regex': search, '$options': 'i'}},
                                        {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                        {phone: {'$regex': search, '$options': 'i'}}
                                    ]
                                }
                            },
                            { $lookup:
                                {
                                    from: UserAzyk.collection.collectionName,
                                    let: { user: '$user' },
                                    pipeline: [
                                        { $match: {$expr:{$eq:['$$user', '$_id']}} },
                                    ],
                                    as: 'user'
                                }
                            },
                            {
                                $unwind:{
                                    preserveNullAndEmptyArrays : true, // this remove the object which is null
                                    path : '$user'
                                }
                            },
                            { $sort : _sort },
                            { $skip : skip!=undefined?skip:0 },
                            { $limit : skip!=undefined?15:10000000000 },
                            {
                                $match:{
                                    'user.status': 'active'
                                }
                            },
                        ])
            }
            return clients
        }
    },
    client: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id))
            return await ClientAzyk.findOne({
                $or:[
                    {_id: _id},
                    {user: _id}
                ]
            }).populate({ path: 'user'})
        else return null
    },
    sortClient: async(parent, ctx, {user}) => {
        let sort = [
        ]
        if(['организация', 'менеджер', 'admin'].includes(user.role)) {
            sort = [
                {
                    name: 'Имя',
                    field: 'name'
                },
                {
                    name: 'Регистрация',
                    field: 'createdAt'
                },
                {
                    name: 'Активность',
                    field: 'lastActive'
                },
                {
                    name: 'Уведомления',
                    field: 'notification'
                },
                {
                    name: 'Устройства',
                    field: 'device'
                }
            ]
        }
        return sort
    },
    filterClient: async() => {
            return await []
    },
};

const resolversMutation = {
    addClient: async(parent, {image, name, email, city, address, phone, info, login, password}, {user}) => {
        if(['admin'].includes(user.role)) {
            let newUser = new UserAzyk({
                login: login.trim(),
                role: 'client',
                status: 'active',
                password: password,
            });
            newUser = await UserAzyk.create(newUser);
            let client = {status: 'active', user: newUser._id}
            if(name)client.name = name
            if(email)client.email = email
            if(city)client.city = city
            if(address)client.address = address
            if(phone)client.phone = phone
            if(info)client.info = info
            if (image) {
                let {stream, filename} = await image;
                filename = await saveImage(stream, filename)
                client.image = urlMain + filename
            }
            client.notification=false
            client = new ClientAzyk(client);
            await ClientAzyk.create(client);
        }
        return {data: 'OK'}
    },
    setClient: async(parent, {_id, image, name, email, address, info, newPass, phone, login, city, device}, {user, res}) => {
        let object = await ClientAzyk.findOne({_id: _id})
        if(
            ['агент', 'admin', 'суперагент'].includes(user.role)||
            object.user&&object.user.toString()===user._id.toString()
        ) {
            if (image) {
                let {stream, filename} = await image;
                if(object.image&&object.image.includes(urlMain))
                    await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(name) object.name = name
            if(email) object.email = email
            if(address) object.address = address
            if(info) object.info = info
            if(city) object.city = city
            if(phone) object.phone = phone
            if(device) object.device = device

            if(newPass||login){
                let objectUser = await UserAzyk.findById(object.user)
                if(newPass)objectUser.password = newPass
                if(login)objectUser.login = login.trim()
                objectUser.save()
                if(objectUser._id.toString()===user._id.toString())
                    await createJwtGQL(res, objectUser)
            }

            object.save();
        }
        return {data: 'OK'}
    },
    deleteClient: async(parent, { _id }, {user}) => {
        let objects = await ClientAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(
                user.role==='admin'
            ){
                if(objects[i].image)
                    await deleteFile(objects[i].image)
                if(objects[i].user) {
                    let object = await UserAzyk.findOne({_id: objects[i].user})
                    object.status = object.status === 'active' ? 'deactive' : 'active'
                    await object.save()
                }
                objects[i].del = 'deleted'
                objects[i].save()
                await Integrate1CAzyk.deleteMany({client: objects[i]._id})
            }
        }
        return {data: 'OK'}
    },
    onoffClient: async(parent, { _id }, {user}) => {
        let objects = await ClientAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(
                ['агент', 'admin', 'суперагент'].includes(user.role)
            ){
                let object = await UserAzyk.findOne({_id: objects[i].user})
                object.status = object.status==='active'?'deactive':'active'
                await object.save()
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