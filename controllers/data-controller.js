const router = require('express').Router();
const asyncMiddleware = require('../utils/async-middleware');

module.exports = (app, licensesDAO) => {

    router.get("/", asyncMiddleware(async (req, res, next) => {
       
        try {
            const { success, businesses, err } = await licensesDAO.getAllBusinesses();
            if (success) {
                return res.json(businesses)
            }
            res.statusCode = 500
            res.json(err)
        } catch (err) {
            res.statusCode = 500
            res.json(err)
        }

    }));

    app.use('/data', router);
    
}