//  auth.js
//
//  Provides user handling functions
//  Requires: fs, Express, cookie-parser app.use(bodyParser.json())

const fs = require('fs');
const path = require('path');

function _enforce_credential_requirements (req) {
    // return: true | false
    // succeeds client-side credential requirement checks

    let user_credentials = req.body;

    if ( ! (
        user_credentials.uid.length >= 4
        && /[a-z]/.test(user_credentials.uid)
        && /[_]/.test(user_credentials.uid)
        && ! /[A-Z]/.test(user_credentials.uid) 
        && ! /[\.]/.test(user_credentials.uid)
        && ! /[\@\#\%\&\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:\-]/.test(user_credentials.uid)
        && user_credentials.pwd.length >= 8
        && /[a-z]/.test(user_credentials.pwd)
        && /[A-Z]/.test(user_credentials.pwd)
        && /[\_\@\#\%\&\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:\-]/.test(user_credentials.pwd)
        && ! /[\.]/.test(user_credentials.pwd)
    ) ) {
        return false;
    }
    else {
        return true
    }
}

function _create_user_record (req) {
    // return: { valid, message }
    // check for existing accounts, write to user data file

    let user_credentials = req.body;
    let user_accounts_file_path = path.join(path.dirname(require.main.filename), 'data/users.json');
    let users;
    try {
        users = JSON.parse(fs.readFileSync(user_accounts_file_path, { encoding: 'utf-8' }));
    }
    catch {
        // create file if it doesn't exist
        fs.openSync(user_accounts_file_path, 'w');
        try {
            users = JSON.parse(fs.readFileSync(user_accounts_file_path, { encoding: 'utf-8' }));
        }
        catch {
            users = [];
        }
    }

    // check for existing account
    let matched_user = users.find( (user) => {
        return user.uid == user_credentials.uid;
    } );
    if ( matched_user != undefined ) {
        return { valid: false, message: "User already exists" };
    }

    // add user account
    users.push( {
        uid: user_credentials.uid,
        pwd: user_credentials.pwd
    } );

    fs.writeFileSync(user_accounts_file_path, JSON.stringify(users, null, 2), { encoding: 'utf8' });

    return { valid: true, message: "User created successfully" };
}

function _delete_user_record () {
    // return: true | false
    // remove user data
}

function _validate_user_credentials (req) {
    // return: { valid, message }
    // credential checking procedure
    // use req.body.uid, etc
    // write to login_attempts.json, get login attempts with time delta < 24 hours, lockout if > 5
    // successful login resets login attempts

    let user_credentials = req.body;
    let user_accounts_file_path = path.join(path.dirname(require.main.filename), 'data/users.json');
    let login_attempts_file_path = path.join(path.dirname(require.main.filename), 'data/login_attempts.json');

    let users;
    try {
        users = JSON.parse(fs.readFileSync(user_accounts_file_path, { encoding: 'utf-8' }));

        try {
            login_attempts = JSON.parse(fs.readFileSync(login_attempts_file_path, { encoding: 'utf-8' }));
        }
        catch {
            // create file if it doesn't exist
            fs.openSync(login_attempts_file_path, 'w');
            try {
                login_attempts = JSON.parse(fs.readFileSync(login_attempts_file_path, { encoding: 'utf-8' }));
            }
            catch {
                login_attempts = []; // { uid, time }
            }
        }

        // check for existing account
        let matched_user = users.find( (user) => {
            return user.uid == user_credentials.uid;
        } );
        if ( matched_user == undefined ) {
            return { valid: false, message: "Login failed" };
        }

        let user_login_attempts = login_attempts.filter( (attempt) => {
            // attempts within the last 24 hours
            return attempt.uid == user_credentials.uid
            && (new Date(attempt.time).valueOf() - (new Date().valueOf() - 24 * 60 * 60 * 1000)) > 0;
        } );

        if ( user_login_attempts.length > 5 ) {
            return { valid: false, message: "Login failed: Account Locked" };
        }

        if ( matched_user.pwd != user_credentials.pwd ) {
            login_attempts.push( {
                uid: user_credentials.uid,
                time: Date.now()
            } );
            fs.writeFileSync(login_attempts_file_path, JSON.stringify(login_attempts, null, 2), { encoding: 'utf8' });
            return { valid: false, message: `Login failed: ${5 - user_login_attempts.length} attempts remaining` };
        }
        else {
            // reset user login attempts
            login_attempts = login_attempts.filter( (attempt) => {
                return attempt.uid != user_credentials.uid;
            } );
            fs.writeFileSync(login_attempts_file_path, JSON.stringify(login_attempts, null, 2), { encoding: 'utf8' });
            return { valid: true, message: "User credentials successfully validated" };
        }
    }
    catch ( err ) {
        console.log(err);
        return { valid: false, message: "Login failed" };
    }
}

function _create_user_session (req) {
    // return: user session ID
    // create user session on login
    // in the future, this will call query.js to store session with user in mongo, I think
    // reference https://www.workfall.com/learning/blog/how-to-perform-a-session-based-user-authentication-in-express-js/

    req.session.uid = req.body.uid;
    return true;
}

function _delete_user_session () {
    // return: user session ID | false
    // delete user session on logout
}

function _is_user_authenticated (req) {
    // return: true | false
    // check user session

    return req.session.uid == undefined ? false : true;
}

module.exports = {

    enforceSession: function (req, res, next) {
        // call at the start of every route where user must be authenticated
        // send user to login if not authenticated

        if ( _is_user_authenticated(req) == false ) {
            // save referrer, redirect back on successful login
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
            if ( req.baseUrl + req.path != '/login' ) {
                let url = req.url;
                url = req.url == '/' ? 'home' : url;
                let encoded_redirect_url = encodeURIComponent(url);

                res.redirect(`/login?ref=${encoded_redirect_url}`);
            }
        }
        else {
            next();
        }
    },

    registerUserCredentials: function (req) {
        // return: { valid, message }
        // check credentials and existing accounts, finally writing user record
        // email verification would go here, 2FA, etc.

        return _enforce_credential_requirements(req) == true
            ? _create_user_record(req)
            : { valid: false, message: 'User credentials do not meet security requirements' };
    },

    authenticateUser: function (req) {
        // return: { valid, message }
        // set session ID, return response to client browser, client initiated redirect if successful

        let login_status = _validate_user_credentials(req);
        
        if ( login_status.valid == true ) {
            _create_user_session(req);
            return login_status;
        }
        else {
            return login_status;
        }
    },

    isUserAuthenticated: _is_user_authenticated

}
