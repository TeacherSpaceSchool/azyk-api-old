const AdsAzyk = require('../models/adsAzyk');

module.exports.reductionToAds = async() => {
    let agentRoutes = await AdsAzyk.find()
    console.log(`reductionToAds: ${agentRoutes.length}`)
    let deletes = []
    for(let i = 0; i<agentRoutes.length;i++){
        for(let i1 = 0; i1<7;i1++){
            deletes = []
            for(let i2 = 0; i2<agentRoutes[i].clients[i1].length;i2++){
                let index = agentRoutes[i].district.client.indexOf(agentRoutes[i].clients[i1][i2]._id.toString())
                if(index===-1)
                    deletes.push(i2)
            }
            for(let i2 = 0; i2<deletes.length;i2++){
                agentRoutes[i].clients[i1].splice(deletes[i2], 1)
            }
        }
        await agentRoutes[i].save()
    }
}