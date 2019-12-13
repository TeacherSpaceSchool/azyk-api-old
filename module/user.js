const UserAzyk = require('../models/userAzyk');
let adminId = '';
const adminLogin = require('./const').adminLogin,
    adminPass = require('./const').adminPass;


let getAdminId = () => {
    return adminId
}

let checkAdmin = async (role, status) => {
    return (role=='admin'&&status=='active')
}

module.exports.createAdmin = async () => {
    await UserAzyk.deleteMany({login: adminLogin});
        let findAdmin = await UserAzyk.findOne({login: adminLogin});
        if(!findAdmin){
            const _user = new UserAzyk({
                login: adminLogin,
                role: 'admin',
                status: 'active',
                password: adminPass,
            });
            findAdmin = await UserAzyk.create(_user);
        }
        adminId = findAdmin._id.toString();
}

module.exports.reductionToUser = async() => {
    let users = await UserAzyk.find({login: null})
    console.log(`reductionToUser: ${users.length}`)
    for(let i = 0; i<users.length;i++){
        users[i].login = users[i].phone
        users[i].save();
    }
}

module.exports.getAdminId = getAdminId;
module.exports.checkAdmin = checkAdmin;
