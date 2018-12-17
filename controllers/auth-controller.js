const router = require('express').Router();
const asyncMiddleware = require('../utils/async-middleware');
const passport = require('passport')

module.exports = (app) => {

    router.get("/google", passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/userinfo.email'], access_type: 'offline'}));

    router.get('/google/callback', passport.authenticate('google'), asyncMiddleware(async (req, res, next) => {
        res.redirect('/data/')
    }))

    router.get('/logout', asyncMiddleware(async (req, res, next) => {
        req.logout();
        res.redirect('/data/')
    }))

    app.use('/auth', router);
    
}