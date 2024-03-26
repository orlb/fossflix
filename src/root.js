// root.js
// Root router module

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const user = require('./modules/user');

const router = express.Router();
router.use(bodyParser.json());

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

router.get('/movie/:movie_id/thumbnail', user.enforceSession, function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), `./upload/thumbnail/${req.params.movie_id}.mp4/tn.png`));
});

router.get('/movie/:movie_id/video', user.enforceSession, function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), `./upload/movie/${req.params.movie_id}.mp4`));
});

router.get('/movie/:movie_id/watch', user.enforceSession, function(req, res) {
    // render movie player template with video
    res.status(200);
});

module.exports = router;
