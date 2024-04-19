// api.js
// REST API router module

const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const mongo = require('mongodb');

const multer  = require('multer');
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, new mongo.ObjectId().toString());
    },
    destination: (req, file, cb) => {
        cb(null, path.join(path.dirname(require.main.filename), './upload/movie/'));
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
const fs = require('fs');
router.post('/movies/add', user.enforceSession, upload.single('movie'), function(req, res) {
    const movie_id = req.file.filename;
    const movie_metadata = req.body;

    req.connection.on('close', function() {
        if (!res.finished) {
            console.log('Client disconnected during upload');
            removeUploadedFile(req.file.path); // Cleanup function
        }
    });

    new ffmpeg(req.file.path)
        .takeScreenshots({
            size: '640x360',
            count: 1,
            folder: path.join(path.dirname(require.main.filename), '/upload/thumbnail/'),
            filename: movie_id
        })
        .on('end', function() {
            query.addMovie(movie_id, movie_metadata)
                .then(result => res.status(201).json(result))
                .catch(err => {
                    console.log(err);
                    removeUploadedFile(req.file.path);
                    res.status(500).send(err.message);
                });
        })
        .on('error', function(err) {
            console.error('Error processing video:', err);
            removeUploadedFile(req.file.path);
            res.status(500).send('Error processing video');
        });
});

function removeUploadedFile(filePath) {
    // Remove the movie file
    fs.unlink(filePath, err => {
        if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
        } else {
            console.log(`Successfully deleted file ${filePath}`);
            // Also attempt to remove thumbnail if movie file deletion is successful
            const thumbPath = filePath.replace('/movie/', '/thumbnail/').replace(/\.\w+$/, '.png');
            fs.unlink(thumbPath, thumbErr => {
                if (thumbErr) {
                    console.error(`Error deleting thumbnail ${thumbPath}:`, thumbErr);
                } else {
                    console.log(`Successfully deleted thumbnail ${thumbPath}`);
                }
            });
        }
    });
}



// Remove movie
router.delete('/movies/delete/:id', user.enforceSession, function(req, res) {
    const movie_id = req.params.id;
    query.removeMovie(movie_id)
        .then(code => res.sendStatus(code))
        .catch(err => res.status(500).send(err.message));
});

// Update movie
router.put('/movies/update/:id', user.enforceSession, function(req, res) {
    const movieId = req.params.id;
    const metadata = req.body.metadata;
    query.updateMovie(movieId, metadata)
        .then(result => res.status(200).json(result))
        .catch(err => res.status(500).json({ message: err.message }));
});

// Like/Unlike movie
router.post('/movies/like/:id', user.enforceSession, async function(req, res) {
    const movieId = req.params.id;
    const userId = req.session.uid;

    try {
        const result = await query.toggleLike(movieId, userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).send('Error toggling like');
    }
});

// Add a comment
router.post('/movies/comment/:id', user.enforceSession, async (req, res) => {
    const movieId = req.params.id;
    const { comment } = req.body;
    const username = req.session.uid;

    if (!comment) {
        return res.status(400).json({ message: "Comment is required." });
    }

    try {
        await query.addComment(movieId, username, comment);
        res.status(200).json({ message: "Comment added successfully." });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Error adding comment');
    }
});

module.exports = router;
