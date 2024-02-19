//  app.js
//
//  Package entry point, express.js startup, configuration and routes

const express = require('express');
const path = require('path');

const user = require('./modules/auth');

const app = express();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'html/index.html'));
});

app.post('/access', function(req, res) {
    console.log("User attempted to login / register");
    res.redirect('/?a=login_success');
});

app.listen(8443, '0.0.0.0');
console.log('Server started at http://localhost');
