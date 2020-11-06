const LotteryAzyk = require('../models/lotteryAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const UserAzyk = require('../models/userAzyk');
const ClientAzyk = require('../models/clientAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');
const mongoose = require('mongoose');

const type = `
  type Lottery {
    _id: ID
    createdAt: Date
    image: String,
    organization: Organization
    status: String
    text: String
    date: Date
    prizes: [LotteryPrize]
    photoReports: [LotteryPhotoReport]
    tickets: [LotteryTicket]
  }
  type LotteryTicket {
        status: String
        number: String
        client: Client
        prize: String
        countWin: Int
        coupons: Int
  }
  input LotteryTicketInput {
        number: String
        client: ID
        countWin: Int
        coupons: Int
  }
  type LotteryPrize {
        _id: ID
        image: String
        name: String
        count:  Int
  }
  input LotteryPrizeInput {
        _id: ID
        image: Upload
        name: String
        count:  Int
  }
  type LotteryPhotoReport {
        _id: ID
        image: String
        text: String
  }
  input LotteryPhotoReportInput {
        _id: ID
        image: Upload
        text: String
  }
`;

const query = `
    lotterys: [Lottery]
    lottery(_id: ID!): Lottery
    clientsForLottery(lottery: ID, search: String!): [Client]
`;

const mutation = `
    addLottery(image: Upload, organization: ID, text: String, date: Date, prizes: [LotteryPrizeInput]): Data
    setLottery(_id: ID!, image: Upload, text: String, date: Date, tickets: [LotteryTicketInput], prizes: [LotteryPrizeInput], photoReports: [LotteryPhotoReportInput]): Data
    setLotteryTickets(_id: ID!): Data
    setLotteryPrizes(_id: ID!): Data
    setLotteryPhotoReport(_id: ID!): Data
    checkWinners(_id: ID!): Data
    deleteLottery(_id: [ID]!): Data
`;

const resolvers = {
    clientsForLottery: async(parent, {lottery, search}, {user}) => {
        let dateEnd = new Date()
        dateEnd.setDate(dateEnd.getDate()+1)
        dateEnd.setHours(3, 0, 0, 0)
        let dateStart = new Date(dateEnd)
        dateStart.setMonth(dateStart.getMonth()-1)
        lottery = await LotteryAzyk.findOne({
            _id: lottery,
            ...user.organization ? {organization: user.organization} : {}
        })
            .select('tickets organization')
            .lean()
        /*let data = {}
        let allowedClients = await InvoiceAzyk.find(
            {
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                agent: null,
                del: {$ne: 'deleted'},
                taken: true,
                organization: lottery.organization
            }
        )
            .select('client')
            .lean()
        for(let i = 0; i<allowedClients.length;i++) {
            if(data[allowedClients[i].client]==undefined)
                data[allowedClients[i].client] = 0
            data[allowedClients[i].client] += 1
        }
        const keys = Object.keys(data)
        allowedClients = []
        for(let i=0; i<keys.length; i++){
            if(data[keys[i]]>3) allowedClients.push(new mongoose.Types.ObjectId(keys[i]))
        }*/
        let clients = lottery.tickets.map(element => element.client)
        clients = await ClientAzyk
            .aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
                            /*$and: [{*/_id: {$nin: clients}/*}, {_id: {$in: allowedClients}}]*/,
                            $or: [
                                {name: {'$regex': search, '$options': 'i'}},
                                //{device: {'$regex': search, '$options': 'i'}},
                                {address: {$elemMatch: {$elemMatch: {'$regex': search, '$options': 'i'}}}},
                                //{phone: {'$regex': search, '$options': 'i'}}
                            ]
                        }
                    },
                    {
                        $lookup:
                            {
                                from: UserAzyk.collection.collectionName,
                                let: {user: '$user'},
                                pipeline: [
                                    {$match: {$expr: {$eq: ['$$user', '$_id']}}},
                                ],
                                as: 'user'
                            }
                    },
                    {
                        $unwind: {
                            preserveNullAndEmptyArrays: true, // this remove the object which is null
                            path: '$user'
                        }
                    },
                    {
                        $match: {
                            'user.status': 'active'
                        }
                    },
                ])
        /*for(let i=0; i<clients.length; i++){
            for(let i1=0; i1<clients[i].address.length; i1++) {
                clients[i].name+=` | ${clients[i].address[i1][2]?`${clients[i].address[i1][2]}, `:''}${clients[i].address[i1][0]}`
            }
        }*/
        return clients
    },
    lotterys: async(parent, ctx, {user}) => {
        let res = await LotteryAzyk.find({
            ...user.organization?{organization: user.organization}:{}
        })
            .populate({
                path: 'organization',
                select: 'name _id'
            })
            .sort('-createdAt')
            .lean()
        return res
    },
    lottery: async(parent, {_id}, {user}) => {
        let res = await LotteryAzyk.findOne({
            _id: _id,
            ...user.organization?{organization: user.organization}:{}
        })
            .populate({
                path: 'organization',
                select: 'name _id'
            })
            .populate({
                path: 'tickets.client',
                select: 'name _id'
            })
            .lean()
        return res
    }
};

const resolversMutation = {
    addLottery: async(parent, {image, organization, text, date, prizes}, {user}) => {
        if(['admin'].includes(user.role)){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let _prizes = []
            for(let i = 0; i<prizes.length;i++) {
                let { stream, filename } = await prizes[i].image;
                filename = await saveImage(stream, filename)
                _prizes.push({
                    image: urlMain+filename,
                    name: prizes[i].name,
                    count:  prizes[i].count
                })
            }
            let _object = new LotteryAzyk({
                image: urlMain+filename,
                organization: organization,
                status: 'розыгрыш',
                text: text,
                date: date,
                prizes: _prizes,
                photoReports: [],
                tickets: []
            });
            await LotteryAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setLottery: async(parent, {_id, image, text, date, tickets, prizes, photoReports}, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let object = await LotteryAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(text) object.text = text
            object.date = date
            if(tickets) {
                let _tickets = []
                for (let i = 0; i < tickets.length; i++) {
                    _tickets.push({status: 'розыгрыш', number: tickets[i].number, client: tickets[i].client, prize: undefined, countWin:  tickets[i].countWin, coupons:  tickets[i].coupons})
                }
                object.tickets = _tickets
            }
            let _prizes = []
            for(let i = 0; i<prizes.length;i++) {
                if(prizes[i].image) {
                    let {stream, filename} = await prizes[i].image;
                    filename = await saveImage(stream, filename)
                    _prizes.push({
                        image: urlMain + filename,
                        name: prizes[i].name,
                        count: prizes[i].count
                    })
                }
                else {
                    for (let i1 = 0; i1 < object.prizes.length; i1++) {
                        if (object.prizes[i1]._id.toString() === prizes[i]._id.toString())
                            _prizes.push({
                                image: object.prizes[i1].image,
                                name: prizes[i].name,
                                count: prizes[i].count
                            })
                    }
                }
            }
            object.prizes = _prizes
            let _photoReports = []
            for(let i = 0; i<photoReports.length;i++) {
                if(photoReports[i].image) {
                    let {stream, filename} = await photoReports[i].image;
                    filename = await saveImage(stream, filename)
                    _photoReports.push({
                        image: urlMain + filename,
                        text: photoReports[i].text
                    })
                }
                else {
                    for (let i1 = 0; i1 < object.photoReports.length; i1++) {
                        if (object.photoReports[i1]._id.toString() === photoReports[i]._id.toString())
                            _photoReports.push({
                                image: object.photoReports[i1].image,
                                text: photoReports[i].text
                            })
                    }
                }
            }
            object.photoReports = _photoReports
            await object.save();
        }
        return {data: 'OK'}
    },
    checkWinners: async(parent, {_id}, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let object = await LotteryAzyk.findById(_id)
            if(object.status==='розыгрыш'){
                let tickets = []
                let shuffleTickets = []
                let winners = []
                let index = 0
                if(object.tickets.length) {
                    for (let i = 0; i < object.tickets.length; i++) {
                        for (let i1 = 0; i1 < object.tickets[i].coupons; i1++) {
                            tickets.push(object.tickets[i])
                        }
                    }
                    while(tickets.length){
                        index = Math.floor(Math.random() * (Math.floor(tickets.length) - Math.ceil(0))) + Math.ceil(0)
                        shuffleTickets.push(tickets[index])
                        tickets.splice(index, 1)
                    }
                    for (let i = 0; i < object.prizes.length; i++) {
                         for (let i1 = 0; i1 < object.prizes[i].count; i1++) {
                            if(shuffleTickets.length) {
                                index = Math.floor(Math.random() * (Math.floor(shuffleTickets.length) - Math.ceil(0))) + Math.ceil(0)
                                for (let i2 = 0; i2 < object.tickets.length; i2++) {
                                    if(object.tickets[i2]._id.toString()===shuffleTickets[index]._id.toString()){
                                        object.tickets[i2].countWin--
                                        object.tickets[i2].status = 'победитель'
                                        if(!object.tickets[i2].prize)
                                            object.tickets[i2].prize = object.prizes[i].name
                                        else
                                            object.tickets[i2].prize = `${object.tickets[i2].prize}, ${object.prizes[i].name}`
                                        if(!object.tickets[i2].countWin) {
                                            for (let i3 = 0; i3 < shuffleTickets.length; i3++) {
                                                if(object.tickets[i2]._id.toString()===shuffleTickets[i3]._id.toString()) {
                                                    shuffleTickets.splice(i3, 1)
                                                    i3--
                                                    break
                                                }
                                            }
                                        }
                                        else {
                                            shuffleTickets.splice(index, 1)
                                        }
                                        break
                                    }
                                }
                            }
                        }
                    }
                }
                for (let i = 0; i < object.tickets.length; i++) {
                    if(object.tickets[i].status === 'победитель'){
                        winners.push(object.tickets[i])
                        object.tickets.splice(i, 1)
                        i--
                    }
                    else {
                        object.tickets[i].status = 'проигравший'
                    }
                }
                object.tickets = [...winners, ...object.tickets]
                object.status = 'разыграна'
                await object.save();
            }
        }
        return {data: 'OK'}
    },
    deleteLottery: async(parent, { _id }, {user}) => {
        if(['суперорганизация', 'организация', 'admin'].includes(user.role)){
            let objects = await LotteryAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
                for(let i1=0; i1<objects[i].prizes.length; i1++) {
                    await deleteFile(objects[i].prizes[i1].image)
                }
                for(let i1=0; i1<objects[i].photoReports.length; i1++) {
                    await deleteFile(objects[i].photoReports[i1].image)
                }
            }
            await LotteryAzyk.deleteMany({_id: {$in: _id}})

        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;