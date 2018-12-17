const express = require("express");
const bodyParser = require("body-parser");
const compression = require('compression');
const cors = require('cors');
const cookieSession = require('cookie-session');
const multer = require('multer');
const logger = require("morgan");
const upload = multer();
const methodOverride = require("method-override");
const passport = require('passport')

process.title = "GotBusinessServer"

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const app = express();

//allow PUT, PATCH, DELETE via _method param
app.use(methodOverride('_method'))
// override with different headers; last one takes precedence
app.use(methodOverride('X-HTTP-Method')) //          Microsoft
app.use(methodOverride('X-HTTP-Method-Override')) // Google/GData
app.use(methodOverride('X-Method-Override')) //      IBM

// allow cors (update later)
app.use(cors());

// Use morgan for logs 
app.use(logger("dev"));

// Specify the port.
var port = process.env.PORT || 8282;
//support gzip
app.use(compression());

//body parser for routes our app
app.use(bodyParser.json());
// parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [ process.env.cookieKey ],
    }),
);
app.set('port', port);

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const uri = process.env.MONGODB_CONNECT_STRING || 'mongodb://localhost:27017/localbusinesses';

const client = new MongoClient(uri, {useNewUrlParser: true});
let server;
client.connect((err, client) => {
    "use strict";
    //test connection for errors, will stop app if Mongo connection is down on load
    assert.equal(null, err);
    assert.ok(client !== null);
    console.log("Somewhere a SQLFairy lost it's wings...Mongo Pokémon evolved.");

    const dbName = 'localbusinesses';
    const db = client.db(dbName);

    const LicensesDAO = require('./models/licenses.js');
    const licensesDAO = new LicensesDAO(db)
    const UsersDAO = require('./models/users.js');
    const usersDAO = new UsersDAO(db)

    const initGoogleStragegy = require('./utils/passport')
    initGoogleStragegy(usersDAO)

    app.use(passport.initialize());
    app.use(passport.session());

    require('./controllers/data-controller')(app, licensesDAO);
    require('./controllers/auth-controller')(app);

    // Listen on port 3000 or assigned port
    server = app.listen(app.get('port'), () =>  console.log(`\nAttention citizens, tune to channel ${app.get('port')}...Express Pokémon evolved.\n`));

});

const gracefulShutdown = () => {
    console.log("\nReceived kill signal, shutting down gracefully.");
    server.close(() => {
        client.close((err)=>{
            if (err) console.error({ err })
            console.log("Closed out remaining connections.");
            process.exit(1)
        });
    });
    
     // if after 
     setTimeout(function() {
        console.error("Could not close connections in time, forcefully shutting down");
        process.exit(1)
    }, 10*1000);
}
  
  // listen for TERM signal .e.g. kill 
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);   


process.on('unhandledRejection', reason => {
    if (reason) {
        console.error({Error:reason})
    }
    process.exit(1);
});