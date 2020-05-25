const RouteAzyk = require('../models/routeAzyk');

module.exports.reductionToRoute = async() => {
    await RouteAzyk.deleteMany()
}