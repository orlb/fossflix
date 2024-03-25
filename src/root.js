// root.js
// Root router module

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const user = require('./modules/user');

const router = express.Router();
router.use(bodyParser.json());

router.get('/video/:video_id', user.enforceSession, function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), `./assets/video/${req.params.video_id}.m4v`));
});

router.get('/login', function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), './templates/login.html'));
});

router.post('/login', function(req, res) {
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

router.get('/', function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), `./templates/root.html`));
});

router.get('/home', user.enforceSession, function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), `./templates/home.html`));
});

router.get('/edit', user.enforceSession, function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), `./templates/edit.html`));
});

module.exports = router;
