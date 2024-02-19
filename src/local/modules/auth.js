//  auth.js
//
//  Provides user handling functions
//  Requires: fs, Express, cookie-parser

function enforceCredentialRequirements (req) {
    // return: { true | false,  error code }
    // succeeds client-side credential requirement checks

    let credential_status = { valid: true };
    return credential_status;
}

function createUserRecord () {
    // return: true | false
    // write to user data file

    return true;
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
        // data entry with user credentials

        let registration_status = enforceCredentialRequirements(req);

        if ( registration_status.valid == true ) {
            if ( createUserRecord(req) == true ) {
                return registration_status;
            }
        }
        else {
            return registration_status;
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
