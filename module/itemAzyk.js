const ItemAzyk = require('../models/itemAzyk');

module.exports.reductionToItem = async() => {
    let items = await ItemAzyk.find({categorys: null})
    console.log(`reductionToItem: ${items.length}`)
    for(let i = 0; i<items.length;i++){
        items[i].categorys = ['A','B','C','D','Horeca']
        await items[i].save();
    }
}