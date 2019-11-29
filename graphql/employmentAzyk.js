const EmploymentAzyk = require('../models/employmentAzyk');
const UserAzyk = require('../models/userAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const { createJwtGQL } = require('../module/passport');

const type = `
  type Employment {
    _id: ID
    name: String
    updatedAt: Date
    email: String
    user: Status,
    organization: Organization,
  }
`;

const query = `
    employments(search: String!, sort: String!, filter: String!): [Employment]
    employment(_id: ID!): Employment
    ecspeditors(_id: ID): [Employment]
    sortEmployment: [Sort]
    filterEmployment: [Filter]
`;

const mutation = `
    addEmployment(name: String!, email: String!, phone: String!, password: String!, role: String!, organization: ID): Data
    setEmployment(_id: ID!, name: String, email: String, newPass: String, role: String, phone: String): Data
    deleteEmployment(_id: [ID]!): Data
    onoffEmployment(_id: [ID]!): Data
`;

const resolvers = {
    employments: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            let employments = await EmploymentAzyk.find()
                .populate({ path: 'user'})
                .populate({ path: 'organization', match: {name: filter.length===0?{'$regex': '', '$options': 'i'}:filter } })
                .sort(sort)
            employments = employments.filter(
                employment => (
                    (employment.user.phone.toLowerCase()).includes(search.toLowerCase())||
                    (employment.name.toLowerCase()).includes(search.toLowerCase())||
                    (employment.email.toLowerCase()).includes(search.toLowerCase())||
                    (employment.user.role.toLowerCase()).includes(search.toLowerCase())
                    )
                    &&employment.organization)
            return employments
        } else if(user.role==='организация'){
            let employments = await EmploymentAzyk.find({
                organization: user.organization
            })
                .populate({ path: 'user'})
                .populate({ path: 'organization' })
                .sort(sort)
            employments = employments.filter(
                employment => (
                        (employment.user.phone.toLowerCase()).includes(search.toLowerCase())||
                        (employment.name.toLowerCase()).includes(search.toLowerCase())||
                        (employment.email.toLowerCase()).includes(search.toLowerCase())||
                        (employment.user.role.toLowerCase()).includes(search.toLowerCase())
                    )
                    &&employment.organization)
            return employments
        }
    },
    ecspeditors: async(parent, {_id}, {user}) => {
        if(user.role==='admin'){
            let employments = await EmploymentAzyk.find({
                organization: _id
            })
                .populate({path: 'user', match: { role: 'экспедитор', status: 'active' }})
                .populate({path: 'organization'})
            employments = employments.filter(employment => (employment.user))
            return employments
        } else if(['организация', 'менеджер'].includes(user.role)){
            let employments = await EmploymentAzyk.find({
                organization: user.organization
            })
                .populate({ path: 'user', match: {role: 'экспедитор', status: 'active'} })
                .populate({ path: 'organization' })
            employments = employments.filter(employment => (employment.user))
            return employments
        }
    },
    employment: async(parent, {_id}, {user}) => {
        if(user.role&&user.role!=='client') {
            let result = await EmploymentAzyk.findOne({
                user: _id
            }).populate({ path: 'user'}).populate({ path: 'organization' })
            if(result === null||(user.role!=='admin'&&user.role!=='организация'))
                return await EmploymentAzyk.findOne({user: user._id}).populate({ path: 'user'}).populate({ path: 'organization' })
            if(user.role==='admin')
                return result
            else if(result&&user.role==='организация'&&user.organization.toString()===result.organization._id.toString())
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
                    field: 'updatedAt'
                }
            ]
        }
        return sort
    },
    filterEmployment: async(parent, ctx, {user}) => {
        if(user.role==='admin'){
            let filter = [
                {
                    name: 'Все',
                    value: ''
                }
            ]
            let organizations = await OrganizationAzyk.find().sort('name')
            for(let i = 0; i<organizations.length; i++){
                filter = [
                    ... filter,
                    {
                        name: organizations[i].name,
                        value: organizations[i].name
                    }
                ]
            }
            return filter
        }
        else
            return []
    },
};

const resolversMutation = {
    addEmployment: async(parent, {name, email, phone, password, role, organization}, {user}) => {
        if(user.role==='admin'||user.role==='организация') {
            let newUser = new UserAzyk({
                phone: phone,
                role: role,
                status: 'active',
                password: password,
            });
            newUser = await UserAzyk.create(newUser);
            const client = new EmploymentAzyk({
                name: name,
                email: email,
                organization: organization,
                user: newUser._id,
            });
            if(user.role==='организация') client.organization = user.organization
            await EmploymentAzyk.create(client);
        }
        return {data: 'OK'}
    },
    setEmployment: async(parent, {_id, name, email, newPass, role, phone}, {user, res}) => {
        let object = await EmploymentAzyk.findById(_id)
        if(
            user.role==='admin'||
            (user.role==='организация'&&user.organization.toString()===object.organization.toString())||
            user._id.toString()===object.user.toString()) {
            if (role || newPass || phone) {
                let objectUser = await UserAzyk.findById(object.user)
                if(phone)objectUser.phone = phone
                if(newPass)objectUser.password = newPass
                if(user.role==='admin' ||user.role==='организация'&&(user.organization.toString()===object.organization.toString()))
                    if(role)objectUser.role = role
                objectUser.save()
                if(objectUser._id.toString()===user._id.toString())
                    await createJwtGQL(res, objectUser)
            }
            if(name)object.name = name
            if(email)object.email = email
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