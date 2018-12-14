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

require('./controllers/data-controller')(app);

// Listen on port 3000 or assigned port
const server = app.listen(app.get('port'), () =>  console.log(`Did you hear that noise R2-${app.get('port')}?`));

const gracefulShutdown = () => {
    console.log("Received kill signal, shutting down gracefully.");
    server.close(() => {
        console.log("Closed out remaining connections.");
        process.exit(1)
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