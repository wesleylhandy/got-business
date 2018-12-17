const express = require("express");
const bodyParser = require("body-parser");
const compression = require('compression');
const path = require('path');
const cors = require('cors');
const ipaddr = require('ipaddr.js');
const multer = require('multer');
const upload = multer();
const fs = require('fs');

process.title = "GotBusinessServer"

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const app = express();

app.use(cors());

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

    require('./controllers/data-controller')(app, licensesDAO);

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