const OrganizationAzyk = require('../models/organizationAzyk');

module.exports.reductionToOrganization= async()=>{
    let organizations = await OrganizationAzyk.find({superagent: null})
    console.log(`reductionToOrganization: ${organizations.length}`)
    for(let i = 0; i<organizations.length;i++){
        organizations[i].superagent = true
        await organizations[i].save();
    }
}