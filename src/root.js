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
    res.render('root', {fossflix_user: {uid: req.session.uid, role: req.session.role}});
});

router.get('/login', function(req, res) {
    if ( user.isUserAuthenticated(req) ) {
        res.redirect('/');
    }
    else {
        res.render('login', {fossflix_user: {uid: req.session.uid, role: req.session.role}});
    }
});

router.post('/login', function(req, res) {
    const login_form = req.body;
    try {
        if (login_form.action === 'register') {
            user.registerUserCredentials(req)
                .then(registration_status => res.status(registration_status.valid ? 200 : 400).json(registration_status));
        }
        else if (login_form.action === 'login') {
            user.authenticateUser(req)
                .then(login_status => res.status(login_status.valid ? 200 : 400).json(login_status));
        }
        else {
            res.sendStatus(400);
        }
    } catch (error) {
        console.error('Error during login or registration:', error);
        res.status(500).json({ valid: false, message: 'Server error occurred' });
    }
});

router.get('/login/role', user.enforceSession, function(req, res) {
    res.render('login-role', {fossflix_user: {uid: req.session.uid, role: req.session.role}});
});

router.post('/login/role', user.enforceSession, function(req, res) {
    user.setUserRole(req)
        .then(role_status => {res.status(role_status.valid ? 200 : 400).json(role_status)});
});

router.get('/logout', function(req, res) {
    req.session.destroy(err => {
        if(err) {
            console.error("Error destroying session:", err);
        }
        res.redirect('/login');
    });
});

router.get('/home', user.enforceSession, user.enforceRole([]), function(req, res) {
    console.log(req.session);
    res.render('home', {fossflix_user: {uid: req.session.uid, role: req.session.role}});
});

router.get('/edit', user.enforceSession, user.enforceRole(['editor']), function(req, res) {
    res.render('edit', {fossflix_user: {uid: req.session.uid, role: req.session.role}});
});

router.get('/edit/upload', user.enforceSession, user.enforceRole(['editor']), function(req, res) {
    res.render('edit-upload', {fossflix_user: {uid: req.session.uid, role: req.session.role}});
});

router.get('/search', user.enforceSession, user.enforceRole([]), function(req, res) {
    res.render('search', {fossflix_user: {uid: req.session.uid, role: req.session.role}});
});

router.get('/watch/:movie_id', user.enforceSession, user.enforceRole(['editor', 'viewer', 'marketing']), async function(req, res) {
    const movie_id = req.params.movie_id;
    const user_id = req.session.uid;
    await query.recordView(movie_id, user_id);
    query.getMovie(movie_id)
        .then(movie_object => {console.log(movie_object); res.render('watch', {
            movie_object: movie_object,
            fossflix_user: {uid: req.session.uid, role: req.session.role}
        })})
        .catch(err => res.status(500).send(err.message));
});

module.exports = router;
