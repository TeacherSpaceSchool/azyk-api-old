const PointShoro = require('../models/pointShoro');
const format = require('./const').stringifyDateTime
const mongoose = require('mongoose');
const RealizatorShoro = require('../models/realizatorShoro');
const OrganizatorShoro = require('../models/organizatorShoro');

const getPointShoroAll = async (id) => {
    try{
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        return await PointShoro
            .find({region: region})
            .distinct('name')
    } catch(error) {
        console.error(error)
    }
}

const getPointShoro1 = async (search, sort, skip, id) => {
    try{
        //console.log(await PointShoro.deleteMany())
        let findResult = [], data = [], count;
        const row = [
            'название',
            'регион',
            'создан'
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='название'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='название'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await PointShoro.count({
                region: region,
            });
            findResult = await PointShoro
                .find({
                    region: region,
                })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await PointShoro.count({
            region: region,
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                region: region,
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else {
            count = await PointShoro.count({
                region: region,
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                region: region,
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                 ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        }
        for (let i=0; i<findResult.length; i++){
            data.push([ findResult[i].name, findResult[i].region, format(findResult[i].updatedAt)]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getPointShoro = async (search, sort, skip) => {
    try{
        //console.log(await PointShoro.deleteMany())
        let findResult = [], data = [], count;
        const row = [
            'название',
            'регион',
            'создан'
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='название'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='название'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await PointShoro.count();
            findResult = await PointShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await PointShoro.count({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else {
            count = await PointShoro.count({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        }
        for (let i=0; i<findResult.length; i++){
            data.push([ findResult[i].name, findResult[i].region, format(findResult[i].updatedAt)]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addPointShoro = async (object) => {
    try{
        let _object = new PointShoro(object);
        await PointShoro.create(_object);
    } catch(error) {
        console.error(error)
    }
}

const setPointShoro = async (object, id) => {
    try{
        await RealizatorShoro.findOneAndUpdate({point: id, region: object.region}, {$set: {point: object.name}});
        await PointShoro.findOneAndUpdate({name: id, region: object.region}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

const deletePointShoro = async (id) => {
    try{
        for(let i=0; i<id.length; i++){
            await PointShoro.deleteMany({name: {$in: id[i].split('|')[0]}, region: {$in: id[i].split('|')[1]}});
        }
    } catch(error) {
        console.error(error)
    }
}

const getPointShoroName = async () => {
    try{
        return await PointShoro.find().distinct('name');
    } catch(error) {
        console.error(error)
    }
}

const getPointShoroRegion = async (region) => {
    try{
        return await PointShoro.find({region: region}).distinct('name');
    } catch(error) {
        console.error(error)
    }
}

module.exports.deletePointShoro = deletePointShoro;
module.exports.getPointShoro = getPointShoro;
module.exports.getPointShoro1 = getPointShoro1;
module.exports.setPointShoro = setPointShoro;
module.exports.addPointShoro = addPointShoro;
module.exports.getPointShoroName = getPointShoroName;
module.exports.getPointShoroRegion = getPointShoroRegion;
module.exports.getPointShoroAll = getPointShoroAll;