//  app.js
//
//  Package entry point, express.js startup, configuration and routes

const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const user = require('./local/modules/auth');


const app = express();
app.use(cookieParser()); // get cookies object at req.cookies
const jsonParser = bodyParser.json();
app.use(express.static(path.join(__dirname, 'public'))); // serve 'public' directory

function enforceSession (req, res) {
    // return: true | false
    // call at the start of every route where user must be authenticated
    // send user to login if not authenticated

    if ( user.updateUserSession(req, res) == true ) {
        return true;
    }
    else {
        // save referrer, redirect back on successful login
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
        let encoded_redirect_url = encodeURIComponent(req.url);
        res.redirect(`/login?ref=${encoded_redirect_url}`);
        return false;
    }
}

app.get('/', function(req, res) {
    if ( ! enforceSession(req, res) ) {
        return;
    }
    res.send(`If you've made it this far, you are probably authenticated.`)
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, './local/html/index.html'));
});

app.post('/login', jsonParser, function(req, res) {
    console.log(req.body);
    if ( req.body.login_form.register ) {
        // login form 'register' button clicked
        if ( user.registerUserCredentials(req).valid == true )
        {
            // send back success code to browser
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400);
        }
    }
    else if ( req.body.login_form.login ) {
        let login_status = user.authenticateUser(req) 
        if ( login_status.valid ) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400).json({ attempts: login_status.attempts });
        }
    }
    res.sendStatus(400);
});

app.listen(8443, '0.0.0.0');
console.log('Server started at http://localhost:8443');
