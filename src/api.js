// api.js
// REST API router module

const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const mime = require('mime-types');
const multer  = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(require.main.filename), './upload/movie/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '.' + mime.extension(file.mimetype));
  }
});
const upload = multer({ storage: storage });

const user = require('./modules/user');
const query = require('./modules/query');

const router = express.Router();
router.use(bodyParser.json());

// Search movies
router.get('/movies/search', function(req, res) {
    const title = req.query.title;
    const sort = req.query.sort || 'date';
    query.searchMovie(title, sort)
        .then(movies => res.status(200).json(movies))
        .catch(err => {console.log(err); res.status(500).send(err.message)});
});

// Add movie
router.post('/movies/add', user.enforceSession, upload.single('movie'), function(req, res) {
    const movie_id = path.basename(req.file.path, '.mp4');
    const movie_metadata = req.body;
    console.log(req.file);
    // create movie thumbnail
    new ffmpeg(req.file.path)
        .takeScreenshots(
            { size: '640x360', count: 1 },
            path.join(path.dirname(require.main.filename), '/upload/thumbnail/' + req.file.filename),
            err => console.log(err)
        );
    query.addMovie(movie_id, movie_metadata)
        .then(result => res.status(201).json(result))
        .catch(err => res.status(500).send(err.message));
});

// Remove movie
router.delete('/api/movies/:id', user.enforceSession, function(req, res) {
    const movieId = req.params.id;
    query.removeMovie(movieId)
        .then(code => res.sendStatus(code))
        .catch(err => res.status(500).send(err.message));
});

// Update movie
router.put('/movies/update/:id', user.enforceSession, function(req, res) {
    const movieId = req.params.id;
    const metadata = req.body.metadata;
    query.updateMovie(movieId, metadata)
        .then(result => res.json(result))
        .catch(err => res.status(500).send(err.message));
});

module.exports = router;
