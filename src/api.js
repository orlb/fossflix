// api.js
// REST API router module

const express = require('express');
const path = require('path');

const user = require('./modules/user');
// const query = require('./modules/query');

const router = express.Router();

router.get('/api/movies/SearchMovies', user.enforceSession, function(req, res) {
    // query api
});

router.get('/api/movies/UpdateMovie', user.enforceSession, function(req, res) {
    // query api
});

module.exports = router;
