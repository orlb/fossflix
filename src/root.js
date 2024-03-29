// root.js
// Root router module

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const user = require('./modules/user');
const query = require('./modules/query');

const router = express.Router();
router.use(bodyParser.json());

router.get('/', function(req, res) {
    res.render('root');
});

router.get('/login', function(req, res) {
    if ( user.isUserAuthenticated(req) ) {
        res.redirect('/');
    }
    else {
        res.render('login');
    }
});

router.post('/login', async function(req, res) {
    let login_form = req.body;

    try {
        if (login_form.action === 'register') {
            console.log('Attempting account registration for user: ' + login_form.uid);
            let registration_status = await user.registerUserCredentials(req);
            console.log(registration_status);
            let response_code = registration_status.valid ? 200 : 400;
            res.status(response_code).json(registration_status);
        } else if (login_form.action === 'login') {
            console.log('Attempting to authenticate user: ' + login_form.uid);
            // Use await to handle the promise returned by authenticateUser
            let login_status = await user.authenticateUser(req);
            console.log(login_status);
            let response_code = login_status.valid ? 200 : 400;
            res.status(response_code).json(login_status);
        } else {
            res.sendStatus(400);
        }
    } catch (error) {
        console.error('Error during login or registration:', error);
        res.status(500).json({ valid: false, message: 'Server error occurred' });
    }
});

router.get('/logout', function(req, res) {
    req.session.destroy(err => {
        if(err) {
            console.error("Error destroying session:", err);
        }
        res.redirect('/login');
    });
});

router.get('/home', user.enforceSession, function(req, res) {
    res.render('home');
});

router.get('/edit', user.enforceSession, function(req, res) {
    res.render('edit');
});

router.get('/edit/upload', user.enforceSession, function(req, res) {
    res.render('edit-upload');
});

router.get('/search', user.enforceSession, function(req, res) {
    res.render('search');
});

router.get('/movie/:movie_id/watch', user.enforceSession, function(req, res) {
    const movie_id = req.params.movie_id;
    query.getMovie(movie_id)
        .then(movie_object => res.render('watch', {movie_object: movie_object}))
        .catch(err => res.status(500).send(err.message));
});

router.get('/movie/:movie_id/thumbnail', function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), `./upload/thumbnail/${req.params.movie_id}.mp4/tn.png`));
});

router.get('/movie/:movie_id/video', user.enforceSession, function(req, res) {
    res.sendFile(path.join(path.dirname(require.main.filename), `./upload/movie/${req.params.movie_id}.mp4`));
});

module.exports = router;
