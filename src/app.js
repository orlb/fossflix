//  app.js
//
//  Package entry point, express.js startup

const config = require('config');
const path = require('path');

const express = require('express');
const session = require('express-session');

const root = require('./root');
const api = require('./api');

const app = express();

// https://expressjs.com/en/resources/middleware/session.html
app.use(session({
    secret: 'fossflixsecretjnkgsdaioxzdgvuoptwjklntqljkhjksc',
    cookie: { maxAge: 30 * 60 * 1000 } // 30 second session timeout
}));

app.use(express.static(path.join(path.dirname(require.main.filename), 'public'))); // serve 'public' directory
app.use('/upload', express.static(path.join(path.dirname(require.main.filename), 'upload')));
app.use('/', root);
app.use('/api', api);

const host = config.get('host');
const port = config.get('port');

app.listen(port, host);
console.log(`Server started at http://${host}:${port}`);
