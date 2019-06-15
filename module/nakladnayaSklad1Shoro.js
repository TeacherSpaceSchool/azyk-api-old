const NakladnayaSklad1Shoro = require('../models/nakladnayaSklad1Shoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const mongoose = require('mongoose');
const skip1 = require('../module/const').skip;

const getNakladnayaSklad1ShoroOrganizator = async (search, sort, skip, id) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'организатор',
            'дата',
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        organizator = organizator.name
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-data';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'data';
        if(search == ''){
            count = await NakladnayaSklad1Shoro.count({organizator: organizator, region: region});
            findResult = await NakladnayaSklad1Shoro
                .find({organizator: organizator, region: region})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaSklad1Shoro.count({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad1Shoro.find({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await NakladnayaSklad1Shoro.count({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad1Shoro.find({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].organizator + ': ' + findResult[i].region, findResult[i].data]);
        }
        console.log(data)
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getNakladnayaSklad1Shoro = async (search, sort, skip) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'организатор',
            'дата',
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='организатор'&&sort[1]=='descending')
            sort = '-organizator';
        else if(sort[0]=='организатор'&&sort[1]=='ascending')
            sort = 'organizator';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-data';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'data';
        if(search == ''){
            count = await NakladnayaSklad1Shoro.count();
            findResult = await NakladnayaSklad1Shoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaSklad1Shoro.count({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad1Shoro.find({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await NakladnayaSklad1Shoro.count({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad1Shoro.find({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].organizator + ': ' + findResult[i].region, findResult[i].data]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addNakladnayaSklad1Shoro = async (object) => {
    try{
        if(await NakladnayaSklad1Shoro.findOne({data: object.data, organizator: object.organizator, region: object.region})===null){
            let _object = new NakladnayaSklad1Shoro(object);
            await NakladnayaSklad1Shoro.create(_object);
        }
    } catch(error) {
        console.error(error)
    }
}

const getNakladnayaSklad1ShoroByData = async (data, organizator, region) => {
    try{
        return(await NakladnayaSklad1Shoro.findOne({data: data, organizator: organizator, region: region}))
    } catch(error) {
        console.error(error)
    }
}

const setNakladnayaSklad1Shoro = async (object, id) => {
    try{
        await NakladnayaSklad1Shoro.findOneAndUpdate({_id: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

const deleteNakladnayaSklad1Shoro = async (id) => {
    try{
        for(let i=0; i<id.length; i++){
            let id1 = id[i].split('|')
            id1[0] = id1[1].split(': ')[0]
            id1[1] = id1[1].split(': ')[1]
            await NakladnayaSklad1Shoro.deleteMany({data: id1[2],
                organizator: id1[0],
                region: id1[1]})

        }
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteNakladnayaSklad1Shoro = deleteNakladnayaSklad1Shoro;
module.exports.getNakladnayaSklad1Shoro = getNakladnayaSklad1Shoro;
module.exports.setNakladnayaSklad1Shoro = setNakladnayaSklad1Shoro;
module.exports.addNakladnayaSklad1Shoro = addNakladnayaSklad1Shoro;
module.exports.getNakladnayaSklad1ShoroOrganizator = getNakladnayaSklad1ShoroOrganizator;
module.exports.getNakladnayaSklad1ShoroByData = getNakladnayaSklad1ShoroByData;