// server.js
// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
var cfenv = require('cfenv');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var io = require('socket.io')();
var watson = require('watson-developer-cloud');
require('./config/passport')(passport);
var chatbot = require('./config/bot.js');
//---Deployment Tracker---------------------------------------------------------
require("cf-deployment-tracker-client").track();
// configuration ===============================================================
// load local VCAP configuration
var vcapLocal = null
if (require('fs').existsSync('./vcap-local.json')) {
    try {
        vcapLocal = require("./vcap-local.json");
        console.log("Loaded local VCAP", vcapLocal);
    }
    catch (e) {
        console.error(e);
    }
}
// get the app environment from Cloud Foundry, defaulting to local VCAP
var appEnvOpts = vcapLocal ? {
    vcap: vcapLocal
} : {}
var appEnv = cfenv.getAppEnv(appEnvOpts);
var appName;
if (appEnv.isLocal) {
    require('dotenv').load();
}
var catalog_url = process.env.CATALOG_URL;
var orders_url = process.env.ORDERS_URL;
console.log("Catalog URL is", catalog_url);
console.log("Orders URL is", orders_url);
// Cloudant
var Logs;
var cloudantURL = appEnv.services.cloudantNoSQLDB[0].credentials.url || appEnv.getServiceCreds("bv-bot-db").url;
var Cloudant = require('cloudant')({
    url: cloudantURL
    , plugin: 'retry'
    , retryAttempts: 10
    , retryTimeout: 500
});
if (cloudantURL) {
    Logs = Cloudant.db.use('logs');
    
}
else {
    console.error("No Cloudant connection configured!");
}
app.use(express.static(__dirname + '/public'));
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.set('view engine', 'html');
// required for passport
app.use(session({
    secret: 'ana-bv-bot'
    , resave: true
    , saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
var bcrypt = require('bcrypt-nodejs');
// =====================================
// REGISTER/SIGNUP =====================
// =====================================
app.get('/', function (req, res) {
    req.session.lastPage = "/";
    res.render('index.html');
});
app.get('/login', function (req, res) {
    res.sendfile('./public/login.html');
});
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/signup', function (req, res) {
    res.sendfile('./public/signup.html');
});
// process the login form
app.post('/login', function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        if (err || info) {
            res.status(500).json({
                'message': info
            });
        }
        else {
            req.logIn(user, function (err) {
                if (err) {
                    res.status(500).json({
                        'message': 'Error logging in. Contact admin.'
                    });
                }
                else {
                    res.status(200).json({
                        'username': user.username
                        , 'fname': user.fname
                        , 'lname': user.lname
                    });
                }
            });
        }
    })(req, res, next);
});
app.post('/signup', function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
        if (err || info) {
            res.status(500).json({
                'message': info
            });
        }
        else {
            console.log("Got user, now verify:", JSON.stringify(user));
            req.logIn(user, function (err) {
                if (err) {
                    console.log("Server error:", JSON.stringify(err));
                    res.status(500).json({
                        'message': "Error validating user. Try logging in."
                    });
                }
                else {
                    res.status(200).json({
                        'username': user.username
                        , 'fname': user.fname
                        , 'lname': user.lname
                    });
                }
            });
        }
    })(req, res, next);
});
app.get('/isLoggedIn', function (req, res) {
    var result = {
        outcome: 'failure'
    };
    if (req.isAuthenticated()) {
        result.outcome = 'success';
        result.username = req.user.username;
        result.fname = req.user.fname;
        result.lname = req.user.lname;
    }
    res.send(JSON.stringify(result, null, 3));
});
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/login');
}
// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
app.get('/profile', isLoggedIn, function (req, res) {
    res.sendfile('./public/index.html');
});
app.get('/health', function (req, res) {
    req.session.lastPage = "/health";
    if (req.isAuthenticated()) {
        res.sendfile('./public/health.html');
    }
    else {
        res.sendfile('./public/login.html');
    }
});
app.get('/soon', function (req, res) {
    res.sendfile('./public/soon.html');
});
app.get('/about', function (req, res) {
    res.redirect("https://github.com/IBM-Bluemix/cloudco-insurance/wiki");
});


// =====================================
// WATSON TRADEOFF TRAVEL ==============
// =====================================
function makePostRequest(payload, url, res) {
    var options = {
        body: payload
        , json: true
        , url: url
    };
    request.post(options, function (err, response) {
        if (err) {
            return res.json(err);
        }
        else {
            return res.json(response.body);
        }
    });
}
// =====================================
// WATSON CONVERSATION FOR ANA =========
// =====================================
app.post('/api/ana', function (req, res) {
    processChatMessage(req, res);
}); // End app.post 'api/ana'
function processChatMessage(req, res) {
    chatbot.sendMessage(req, function (err, data) {
        if (err) {
            console.log("Error in sending message: ", err);
            res.status(err.code || 500).json(err);
        }
        else {
            Logs.find({
                selector: {
                    'conversation': data.context.conversation_id
                }
            }, function (err, result) {
                if (err) {
                    console.log("Cannot find log for conversation id of ", data.context.conversation_id);
                }
                else if (result.docs.length > 0) {
                    var doc = result.docs[0];
                    console.log("Sending log updates to dashboard");
                    //console.log("doc: ", doc);
                    io.sockets.emit('logDoc', doc);
                }
                else {
                    console.log("No log file found.");
                }
            });
            var context = data.context;
            var owner = req.user.username;
            res.status(200).json(data);
        }
    });
}
// launch ======================================================================
io.on('connection', function (socket) {
    console.log("Sockets connected.");
    // Whenever a new client connects send them the latest data
    socket.on('disconnect', function () {
        console.log("Socket disconnected.");
    });
});
io.listen(app.listen(appEnv.port, "0.0.0.0", function () {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
}));