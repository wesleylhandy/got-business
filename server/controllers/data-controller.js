const router = require('express').Router();
const asyncMiddleware = require('../utils/async-middleware');

module.exports = (app, licensesDAO) => {

    router.get("/licenses/all", asyncMiddleware( async (req, res, next) => {
       
        try {
            const { success, businesses, err } = await licensesDAO.getAll('businesses');
            if (success) {
                return res.json(businesses)
            }
            res.statusCode = 500
            res.json(err)
        } catch (err) {
            res.statusCode = 500
            res.json(err)
        }

    }) );

    router.get("/licenses/search/:start(\\d*)?-:end(\\d*)?", asyncMiddleware( async (req, res, next) => {
        let { start, end } = req.params;
        start = start ? +start : 0;
        end = end ? +end : 5000;
        const step = end - start + 1; // add one to be inclusive of end
        const { category } = req.query;
        try {
            const { success, businesses, err } = await licensesDAO.getfilteredBusinesses(category, start, step);
            if (success) {
                return res.json(businesses)
            }
            res.statusCode = 500
            res.json(err)
        } catch (err) {
            res.statusCode = 500
            res.json(err)
        }
    }) );

    app.use('/data', router);
    
}