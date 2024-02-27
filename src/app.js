//  app.js
//
//  Package entry point, express.js startup, configuration and routes

const config = require('config');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const user = require('./modules/auth');
const query = require('./modules/query');


const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(path.dirname(require.main.filename), 'public'))); // serve 'public' directory
// https://expressjs.com/en/resources/middleware/session.html
app.use(session( {
    secret: 'fossflixsecretjnkgsdaioxzdgvuoptwjklntqljkhjksc',
    cookie: { maxAge: 30000 } // 30 second session timeout
} ));

function enforceSession (req, res, next) {
    // call at the start of every route where user must be authenticated
    // send user to login if not authenticated

    if ( user.isUserAuthenticated(req) == false ) {
        // save referrer, redirect back on successful login
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
        if ( req.baseUrl + req.path != '/login' ) {
            let encoded_redirect_url = encodeURIComponent(req.url);

            res.redirect(`/login?ref=${encoded_redirect_url}`);
        }
    }
    else {
        next();
    }
}

app.get('/', enforceSession, function(req, res) {
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
        let j = JSON.stringify(registration_status);
        let response_code = registration_status.valid ? 200 : 400
        res.status(response_code).json(j);
    }
    else if ( login_form.action == 'login' ) {
        console.log('Attempting to authenticate user: ' + login_form.uid);

        let login_status = user.authenticateUser(req) 
        console.log(login_status);
        let j = JSON.stringify(login_status);
        let response_code = login_status.valid ? 200 : 400
        res.status(response_code).json(j);
    }
    else {
        res.sendStatus(400);
    }
});


const host = config.get('host');
const port = config.get('port');

app.listen(port, host);
console.log(`Server started at http://${host}:${port}`);
