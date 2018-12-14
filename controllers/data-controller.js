const router = require('express').Router();
const asyncMiddleware = require('../utils/async-middleware');
const callApi = require('../utils/fetch-helpers')

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const uri = process.env.MONGODB_CONNECT_STRING || 'mongodb://localhost:27017/localbusinesses';
const dbName = 'localbusinesses';
const BusinessDAO = require('../models/businesses.js');

module.exports = app => {

    const client = new MongoClient(uri, {useNewUrlParser: true});

    client.connect((err, client) => {
        "use strict";
        //test connection for errors, will stop app if Mongo connection is down on load
        assert.equal(null, err);
        assert.ok(client !== null);
        console.log("Somewhere a SQLFairy lost it's wings...Mongo Pokemon Evolved!");

        const db = client.db(dbName);

        const businessCollection = db.collection('businesses');

        const businesses = new BusinessDAO(db, businessCollection);

        businesses.createIndexes();

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
    
    });
}