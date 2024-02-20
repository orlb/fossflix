//  app.js
//
//  Package entry point, express.js startup, configuration and routes

const qs = require('querystring');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const user = require('./modules/auth');


const app = express();
app.use(cookieParser()); // get cookies object at req.cookies
app.use(bodyParser.json());
app.use(express.static(path.join(path.dirname(require.main.filename), 'public'))); // serve 'public' directory

function enforceSession (req, res) {
    // call at the start of every route where user must be authenticated
    // send user to login if not authenticated

    if ( user.updateUserSession(req, res) == false ) {
        // save referrer, redirect back on successful login
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
        let encoded_redirect_url = encodeURIComponent(req.url);

        res.redirect(`/login?ref=${encoded_redirect_url}`);
    }
}

app.get('/', function(req, res) {
    enforceSession(req, res);
    res.send(`If you've made it this far, you are probably authenticated.`)
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), './templates/index.html'));
});

app.post('/login', function(req, res) {
    let login_form = req.body;

    if ( login_form.action == 'register' ) {
        // login form 'register' button clicked
        console.log('Attempting account registration for user: ' + login_form.uid);
        let registration_status = user.registerUserCredentials(req);
        console.log(registration_status);

        if ( registration_status.valid ) {
            // send back success code to browser
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400);
        }
    }
    else if ( login_form.action == 'login' ) {
        console.log('Attempting to authenticate user: ' + login_form.uid);
        let login_status = user.authenticateUser(req) 

        if ( login_status.valid ) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400).json({ attempts: login_status.attempts });
        }
    }
    else {
        res.sendStatus(400);
    }
});

app.listen(8443, '0.0.0.0');
console.log('Server started at http://localhost:8443');
