//  app.js
//
//  Package entry point, express.js startup

const config = require('config');
const path = require('path');

const express = require('express');
const session = require('express-session');

const user = require('./modules/user');

const root = require('./root');
const api = require('./api');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(require.main.filename), 'views'));

// https://expressjs.com/en/resources/middleware/session.html
app.use(session({
    secret: 'fossflixsecretjnkgsdaioxzdgvuoptwjklntqljkhjksc',
    cookie: { maxAge: 30 * 60 * 1000 }, // 30 minute session timeout
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
}));

app.use(express.static(path.join(path.dirname(require.main.filename), 'public'))); // serve 'public' directory

const movie = express.Router(); // for /movie route
movie.use(user.enforceSession); // require authentication
movie.use(express.static(path.join(path.dirname(require.main.filename), './upload/movie')));

const thumbnail = express.Router(); // for /thumbnail route
thumbnail.use(express.static(path.join(path.dirname(require.main.filename), './upload/thumbnail')));

app.use('/', root);
app.use('/api', api);
app.use('/movie', movie);
app.use('/thumbnail', thumbnail);

const host = config.get('host');
const port = config.get('port');

app.listen(port, host);
console.log(`Server started at http://${host}:${port}`);
