const express = require('express');
const path = require('path');

const app = express();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/access', function(req, res) {
    console.log("User attempted to login / register");
    res.redirect('/?a=login_success');
});

app.listen(8080);
console.log('Server started at http://localhost');
