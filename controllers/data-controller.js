const router = require('express').Router();
const asyncMiddleware = require('../utils/async-middleware');
const callApi = require('../utils/fetch-helpers')

const BusinessDAO = require('../models/businesses.js');

module.exports = (app, db) => {

    const businesses = new BusinessDAO(db);

    router.get("/", asyncMiddleware(async (req, res, next) => {
        const options = {
            method: "GET",
            headers: {
                "X-APP-Token": process.env.API_KEY,
                "Content-Type": 'application/json',
            }
        }
        const uri = process.env.VB_DATA_URI
        const businessData  = await callApi(uri, options)
        const result = await businesses.insertBusinesses(businessData)
        if (result.success) {
            return res.json(result.businesses)
        }
        res.statusCode = 500
        res.json(result)
    }));

    app.use('/data', router);
    

}