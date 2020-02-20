const EmploymentAzyk = require('../models/employmentAzyk');
const UserAzyk = require('../models/userAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const { createJwtGQL } = require('../module/passport');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const mongoose = require('mongoose')

const type = `
  type Employment {
    _id: ID
    name: String
    createdAt: Date
    email: String
    phone: [String]
    user: Status
    organization: Organization
  }
`;

const query = `
    employments(organization: ID, search: String!, sort: String!, filter: String!): [Employment]
    employment(_id: ID!): Employment
    ecspeditors(_id: ID): [Employment]
    agents(_id: ID): [Employment]
    managers(_id: ID): [Employment]
    sortEmployment: [Sort]
    filterEmployment: [Filter]
`;

const mutation = `
    addEmployment(name: String!, email: String!, phone: [String]!, login: String!, password: String!, role: String!, organization: ID): Data
    setEmployment(_id: ID!, name: String, email: String, newPass: String, role: String, phone: [String], login: String, ): Data
    deleteEmployment(_id: [ID]!): Data
    onoffEmployment(_id: [ID]!): Data
`;

const resolvers = {
    employments: async(parent, {organization, search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            let employments = await EmploymentAzyk.find({organization: organization})
                .populate({ path: 'user', match: {role: filter.length===0?{'$regex': '', '$options': 'i'}:filter } })
                .populate({ path: 'organization'})
                .sort(sort)
            employments = employments.filter(
                employment => {
                    return (
                        employment.user&&
                        (((employment.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (employment.name.toLowerCase()).includes(search.toLowerCase())||
                        (employment.email.toLowerCase()).includes(search.toLowerCase())||
                        (employment.user.role.toLowerCase()).includes(search.toLowerCase()))
                    )
                }
            )
            return employments
        } else if(user.role==='организация'){
            let employments = await EmploymentAzyk.find({
                organization: user.organization
            })
                .populate({ path: 'user', match: {role: filter.length===0?{'$regex': '', '$options': 'i'}:filter } })
                .populate({ path: 'organization' })
                .sort(sort)
            employments = employments.filter(
                employment => (
                    employment.user&&
                    (((employment.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (employment.name.toLowerCase()).includes(search.toLowerCase())||
                        (employment.email.toLowerCase()).includes(search.toLowerCase())||
                        (employment.user.role.toLowerCase()).includes(search.toLowerCase()))
                ))
            return employments
        } else if(user.role==='менеджер'){
            let employments = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('agent')
            employments = await EmploymentAzyk.find({
                _id: {$in: employments}
            })
                .populate({ path: 'user'})
                .populate({ path: 'organization' })
                .sort(sort)
            employments = employments.filter(
                employment => (
                    employment.user&&
                    (((employment.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (employment.name.toLowerCase()).includes(search.toLowerCase())||
                        (employment.email.toLowerCase()).includes(search.toLowerCase())||
                        (employment.user.role.toLowerCase()).includes(search.toLowerCase()))
                ))
            return employments
        }
    },
    ecspeditors: async(parent, {_id}, {user}) => {
        if (user.role === 'admin') {
            if(mongoose.Types.ObjectId.isValid(_id)) {
                let employments = await EmploymentAzyk.find({organization: _id})
                    .populate({path: 'user', match: {role: 'экспедитор', status: 'active'}})
                    .populate({path: 'organization'})
                employments = employments.filter(employment => (employment.user))
                return employments
            }
            else return []
        }
        else if (['организация', 'менеджер'].includes(user.role)) {
            let employments = await EmploymentAzyk.find({
                organization: user.organization
            })
                .populate({path: 'user', match: {role: 'экспедитор', status: 'active'}})
                .populate({path: 'organization'})
            employments = employments.filter(employment => (employment.user))
            return employments
        }
    },
    managers: async(parent, {_id}, {user}) => {
        if (user.role === 'admin') {
            if(mongoose.Types.ObjectId.isValid(_id)) {
                let employments = await EmploymentAzyk.find({organization: _id})
                    .populate({path: 'user', match: {role: 'менеджер', status: 'active'}})
                    .populate({path: 'organization'})
                employments = employments.filter(employment => (employment.user))
                return employments
            }
            else return []
        }
        else if (['организация', 'менеджер'].includes(user.role)) {
            let employments = await EmploymentAzyk.find({
                organization: user.organization
            })
                .populate({path: 'user', match: {role: 'менеджер', status: 'active'}})
                .populate({path: 'organization'})
            employments = employments.filter(employment => (employment.user))
            return employments
        }
    },
    agents: async(parent, {_id}, {user}) => {
        if (user.role === 'admin') {
            if(mongoose.Types.ObjectId.isValid(_id)) {
                let employments = await EmploymentAzyk.find({organization: _id})
                    .populate({path: 'user', match: {role: 'агент', status: 'active'}})
                    .populate({path: 'organization'})
                employments = employments.filter(employment => (employment.user))
                return employments
            }
            else return []
        }
        else if (['организация', 'менеджер'].includes(user.role)) {
            let employments = await EmploymentAzyk.find({
                organization: user.organization
            })
                .populate({path: 'user', match: {role: 'агент', status: 'active'}})
                .populate({path: 'organization'})
            employments = employments.filter(employment => (employment.user))
            return employments
        }
    },
    employment: async(parent, {_id}, {user}) => {
        if(user.role&&user.role!=='client'&&mongoose.Types.ObjectId.isValid(_id)) {
            let result = await EmploymentAzyk.findOne({
                user: _id
            }).populate({ path: 'user'}).populate({ path: 'organization' })
            if(result === null||!['admin', 'организация'].includes(user.role))
                return await EmploymentAzyk.findOne({user: user._id}).populate({ path: 'user'}).populate({ path: 'organization' })
            if(user.role==='admin')
                return result
            else if(result&&'организация'===user.role&&user.organization.toString()===result.organization._id.toString())
                return result
            else
                return null
        }
        else
            return null
    },
    sortEmployment: async(parent, ctx, {user}) => {
        let sort = []
        if(user.role==='admin') {
            sort = [
                {
                    name: 'Имя',
                    field: 'name'
                },
                {
                    name: 'Дата',
                    field: 'createdAt'
                }
            ]
        }
        return sort
    },
    filterEmployment: async(parent, ctx, {user}) => {
        if(['организация', 'менеджер'].includes(user.role))
            return [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Агент',
                    value: 'агент'
                },
                {
                    name: 'Менеджер',
                    value: 'менеджер'
                },
                {
                    name: 'Экспедитор',
                    value: 'экспедитор'
                },
                {
                    name: 'Организация',
                    value: 'организация'
                }
            ]
        else return []
    },
};

const resolversMutation = {
    addEmployment: async(parent, {name, email, phone, login, password, role, organization}, {user}) => {
        if(user.role==='admin'||user.role==='организация') {
            let newUser = new UserAzyk({
                login: login.trim(),
                role: role,
                status: 'active',
                password: password,
            });
            newUser = await UserAzyk.create(newUser);
            const client = new EmploymentAzyk({
                name: name,
                email: email,
                phone: phone,
                organization: organization,
                user: newUser._id,
            });
            if(user.role==='организация') client.organization = user.organization
            await EmploymentAzyk.create(client);
        }
        return {data: 'OK'}
    },
    setEmployment: async(parent, {_id, name, email, newPass, role, login, phone}, {user, res}) => {
        let object = await EmploymentAzyk.findById(_id)
        if(
            user.role==='admin'||
            (user.role==='организация'&&user.organization.toString()===object.organization.toString())||
            user._id.toString()===object.user.toString()) {
            if (role || newPass || login) {
                let objectUser = await UserAzyk.findById(object.user)
                if(login)objectUser.login = login.trim()
                if(newPass)objectUser.password = newPass
                if(user.role==='admin' ||user.role==='организация'&&(user.organization.toString()===object.organization.toString()))
                    if(role)objectUser.role = role
                objectUser.save()
                if(objectUser._id.toString()===user._id.toString())
                    await createJwtGQL(res, objectUser)
            }
            if(name)object.name = name
            if(email)object.email = email
            if(phone)object.phone = phone
            object.save();
        }
        return {data: 'OK'}
    },
    deleteEmployment: async(parent, { _id }, {user}) => {
            let objects = await EmploymentAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                if(user.role==='admin'||(user.role==='организация'&&user.organization.toString()===objects[i].organization.toString())){
                    await UserAzyk.deleteMany({_id: objects[i].user._id})
                    await EmploymentAzyk.deleteMany({_id: objects[i]._id})
                    await Integrate1CAzyk.deleteMany({manager: objects[i]._id, organization: objects[i].organization})
                    await Integrate1CAzyk.deleteMany({agent: objects[i]._id, organization: objects[i].organization})
                    await Integrate1CAzyk.deleteMany({ecspeditor: objects[i]._id, organization: objects[i].organization})
                }
            }
        return {data: 'OK'}
    },
    onoffEmployment: async(parent, { _id }, {user}) => {
        let objects = await EmploymentAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'||(user.role==='организация'&&user.organization.toString()===objects[i].organization.toString())) {
                let object = await UserAzyk.findOne({_id: objects[i].user})
                object.status = object.status === 'active' ? 'deactive' : 'active'
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