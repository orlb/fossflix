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
app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(require.main.filename), 'views'));

// https://expressjs.com/en/resources/middleware/session.html
app.use(session({
    secret: 'fossflixsecretjnkgsdaioxzdgvuoptwjklntqljkhjksc',
    cookie: { maxAge: 30 * 60 * 1000 } // 30 minute session timeout
}));

app.use(express.static(path.join(path.dirname(require.main.filename), 'public'))); // serve 'public' directory
app.use('/', root);
app.use('/api', api);

const host = config.get('host');
const port = config.get('port');

app.listen(port, host);
console.log(`Server started at http://${host}:${port}`);
