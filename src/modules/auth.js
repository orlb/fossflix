//  auth.js
//
//  Provides user handling functions
//  Requires: fs, Express, cookie-parser app.use(bodyParser.json())

const fs = require('fs');
const path = require('path');

function enforceCredentialRequirements (req) {
    // return: true | false
    // succeeds client-side credential requirement checks

    let user_credentials = req.body;

    if ( ! (
        user_credentials.uid.length >= 4
        && /[a-z]/.test(user_credentials.uid)
        && /[_]/.test(user_credentials.uid)
        && ! /[A-Z]/.test(user_credentials.uid) 
        && ! /[\.]/.test(user_credentials.uid)
        && ! /[\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:\-]/.test(user_credentials.uid)
        && user_credentials.pwd.length >= 8
        && /[a-z]/.test(user_credentials.pwd)
        && /[A-Z]/.test(user_credentials.pwd)
        && /[\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:\-]/.test(user_credentials.pwd)
        && ! /[\.]/.test(user_credentials.pwd)
    ) ) {
        return false;
    }
    else {
        return true
    }
}

function createUserRecord (req) {
    // return: { true | false,  error code }
    // check for existing accounts, write to user data file

    let user_credentials = req.body;
    let user_accounts_file_path = path.join(path.dirname(require.main.filename), 'data/users.json');
    let users;
    try {
        users = JSON.parse(fs.readFileSync(user_accounts_file_path, { encoding: 'utf-8' }));
    }
    catch {
        // create file if does not exist
        fs.openSync(user_accounts_file_path, 'w');
        try {
            users = JSON.parse(fs.readFileSync(user_accounts_file_path, { encoding: 'utf-8' }));
        }
        catch {
            users = [];
        }
    }

    // check for existing account
    let matched_uid = users.find( (user) => {
        return user.uid == user_credentials.uid;
    } );
    if ( matched_uid != undefined ) {
        return { valid: false, message: "User already exists" };
    }

    users.push( {
        uid: user_credentials.uid,
        pwd: user_credentials.pwd
    } );

    // add user account
    users = JSON.stringify(users);
    fs.writeFileSync(user_accounts_file_path, users, { encoding: 'utf8' });

    return { valid: true, message: "User created successfully" };
}

function deleteUserRecord () {
    // return: true | false
    // remove user data
}

function validateUserCredentials () {
    // return: { true | false, attempts }
    // credential checking procedure
    // use req.body.username, etc

    return { valid: true };
}

function createUserSession () {
    // return: user session ID | false
    // create user session on login
}

function deleteUserSession () {
    // return: user session ID | false
    // delete user session on logout
}

function getUserSession () {
    // return: user session ID | false
    // query for user session
}

module.exports = {

    registerUserCredentials: function (req) {
        // return: { true | false, error code }
        // check credentials and existing accounts, finally writing user record
        // email verification would go here, etc.

        if ( enforceCredentialRequirements(req) == true ) {
            return createUserRecord(req);
        }
        else {
            return { valid: false, message: 'User credentials do not meet security requirements' };
        }
    },

    authenticateUser: function (req) {
        // return: user session ID | false
        // set session ID, return response to client browser, client initiated redirect if successful

        let login_status = validateUserCredentials(req);
        
        if ( login_status.valid == true ) {
            login_status.sessionid = createUserSession(req);
            return login_status;
        }
        else {
            return login_status;
        }
    },

    updateUserSession: function (req, res) {
        // return: true | false
        // check session expiration, if it exists, and other things
        
        return false;
    },

}
