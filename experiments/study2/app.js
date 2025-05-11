global.__base = __dirname + '/';

var
    use_https = true,
    argv = require('minimist')(process.argv.slice(2)),
    https = require('https'),
    fs = require('fs'),
    app = require('express')(),
    _ = require('lodash'),
    parser = require('xmldom').DOMParser,
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    sendPostRequest = require('request').post,
    cors = require('cors');

////////// EXPERIMENT GLOBAL PARAMS //////////

var gameport;

if (argv.gameport) {
    gameport = argv.gameport;
    console.log('using port ' + gameport);
} else {
    gameport = 8874; // TODO: update experiment port here
    console.log('no gameport specified: using 8874\nUse the --gameport flag to change');
}

try {
    var privateKey = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/privkey.pem'),
        certificate = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/cert.pem'),
        intermed = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/chain.pem'),
        options = { key: privateKey, cert: certificate, ca: intermed },
        server = require('https').createServer(options, app).listen(gameport),
        io = require('socket.io')(server, { allowEIO3: true }); // (junyichu) to support socket.io v2 clients
} catch (err) {
    console.log("cannot find SSL certificates; falling back to http");
    var server = app.listen(gameport),
        io = require('socket.io')(server);
}

// serve stuff that the client requests
app.get('/*', (req, res) => {
    serveFile(req, res);
});

io.engine.on("connection_error", (err) => {
    console.log(err.req);      // the request object
    console.log(err.code);     // the error code, for example 1
    console.log(err.message);  // the error message, for example "Session ID unknown"
    console.log(err.context);  // some additional error context
});

io.on('connection', function (socket) {
    // console.log('Client connected.'); // debug

    // upon stimuli request, serve the stimulus data
    socket.on('getStims', function (data) {
        // // set up trial list for participant
        initializeWithTrials(socket, data.db_name, data.exp_name); // effectively colname
    });

    // upon getting session data from client, write data to db
    socket.on('currentData', function (data, db_name, exp_name, gameid) {
        console.log(gameid + ' currentData received: ' + JSON.stringify(data).substring(100, 200));
        // Increment games list in mongo here
        writeDataToMongo(data, db_name, exp_name);
    });

});

// specify what files are secret
FORBIDDEN_FILES = ["auth.json"]

var serveFile = function (req, res) {
    var fileName = req.params[0];
    if (FORBIDDEN_FILES.includes(fileName)) {
        // Don't serve files that contain secrets
        console.log("Forbidden file requested: " + filename);
        return;
    }
    console.log('\t :: Express :: file requested: ' + fileName);
    return res.sendFile(fileName, { root: __dirname });
};

function initializeWithTrials(socket, db_name, exp_name) {
    // This function requests one entry from the stimuli database to initialize 
    var gameid = UUID();
    sendPostRequest('http://localhost:8032/db/getstims', {
        json: {
            dbname: db_name,
            colname: exp_name,
            gameid: gameid
        }
    }, (error, res, body) => {
        if (!error && res.statusCode === 200 && typeof body !== 'undefined') {
            // send trial list (and id) to client
            var packet = {
                gameid: gameid,
                condition: body.condition,
                stim_id: body._id,
                stimuli_set: body.stimuli_set,
                stims: body.stims,
            };
            // console.log('packet', packet); // debug
            socket.emit('stims', packet);
            console.log("INITIALIZED EXPERIMENT ", exp_name, " :: ", gameid) //debug
        } else {
            console.log(`error getting stims: ${error} ${body}`);
        }
    });
}

var UUID = function () {
    var baseName = (Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10));
    var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    var id = baseName + '-' + template.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return id;
};

var writeDataToMongo = function (data, db_name, exp_name) {
    sendPostRequest(
        'http://localhost:8032/db/insert',
        {
            json: _.extend(
                {
                    dbname: db_name,
                    colname: exp_name
                },
                data)
        },
        (error, res, body) => {
            if (!error && res.statusCode === 200) {
                console.log(`sent data to store`);
            } else {
                console.log(`error sending data to store: ${error} ${body}`);
            }
        }
    );
};