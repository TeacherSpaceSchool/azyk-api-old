const AdsAzyk = require('../models/adsAzyk');

module.exports.reductionToAds = async() => {
    let ads = await AdsAzyk.find()
    console.log(`reductionToAds: ${ads.length}`)
    for(let i = 0; i<ads.length;i++){
        //await ads[i].save()
    }
}