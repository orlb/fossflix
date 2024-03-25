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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + mime.extension(file.mimetype));
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
    const sortMethod = 'uploadDate'; // Assuming you want to sort by upload date
    query.searchMovie(title, sortMethod)
        .then(movies => res.status(movies.code))
        .catch(err => res.status(500).send(err.message));
});

// Add movie
router.post('/movies/add', upload.single('movie'), function(req, res) {
    const movie_path = path.relative(path.dirname(require.main.filename), req.file.path);
    const movie_metadata = req.body;
    console.log()
    // create movie thumbnail
    ffmpeg.ffprobe(req.file.path, function (err, metadata) {
        let proc = new ffmpeg(req.file.path)
            .takeScreenshots(
                { count: 1, timemarks: [ metadata.format.duration / 2 ] },
                path.join(path.dirname(require.main.filename), '/upload/thumbnail/' + req.file.filename),
                err => console.log(err)
            );
    });
    query.addMovie(movie_path, movie_metadata)
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
router.put('/movies/update/:id', function(req, res) {
    const movieId = req.params.id;
    const metadata = req.body.metadata;
    query.updateMovie(movieId, metadata)
        .then(result => res.json(result))
        .catch(err => res.status(500).send(err.message));
});

module.exports = router;
