//  auth.js
//
//  Provides user handling functions

function enforceCredentialRequirements () {
    // return: { True | False,  error code }
    // succeeds client-side credential requirement checks
}

function validateUserCredentials () {
    // return: { True | False, error code }
    // Credential checking procedure
}

function createUserSession () {
    // return: User session ID | False
    // create user session on login
}

function deleteUserSession () {
    // return: User session ID | False
    // delete user session on logout
}

function getUserSession () {
    // return: User session ID | False
    // query for user session
}

module.exports = {

    registerUserCredentials: function () {
        // return: { True | False, error code }
        // data entry with user credentials
        console.log('hi');
    },

    authenticateUser: function () {
        // return: User session ID | False
    },

    updateUserSession: function () {
        // return: True | False
        // check session expiration, if it exists, and other things
    },

}
