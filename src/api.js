// api.js
// REST API router module

const express = require('express');
const path = require('path');

const user = require('./modules/user');
const query = require('./modules/query');

const router = express.Router();

// Search movies
router.get('/api/movies/search', function(req, res) {
    const title = req.query.title;
    const sortMethod = 'uploadDate'; // Assuming you want to sort by upload date
    query.searchMovie(title, sortMethod)
        .then(movies => res.json(movies))
        .catch(err => res.status(500).send(err.message));
});

// Add movie
router.post('/api/movies/add', function(req, res) {
    const { filename, metadata } = req.body;
    query.addMovie(filename, metadata)
        .then(result => res.status(201).json(result))
        .catch(err => res.status(500).send(err.message));
});

// Remove movie
router.delete('/api/movies/:id', function(req, res) {
    const movieId = req.params.id;
    query.removeMovie(movieId)
        .then(code => res.sendStatus(code))
        .catch(err => res.status(500).send(err.message));
});

// Update movie
router.put('/api/movies/update/:id', function(req, res) {
    const movieId = req.params.id;
    const metadata = req.body.metadata;
    query.updateMovie(movieId, metadata)
        .then(result => res.json(result))
        .catch(err => res.status(500).send(err.message));
});

module.exports = router;
