//  user.js
//
//  Provides user handling functions
//  Requires: MongoClient, Express, cookie-parser app.use(bodyParser.json())

const path = require('path');
const { MongoClient } = require('mongodb');
const config = require('config');
const uri = config.get('mongodb_uri');
const client = new MongoClient(uri);
const database_name = config.get('mongodb_db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
};

const _create_user_record = async (req) => {
    try {
        await client.connect();
        const database = client.db(database_name);
        const users = database.collection('users');

        const userCredentials = req.body;
        const existing_user = await users.findOne({ uid: userCredentials.uid });
        if ( existing_user ) {
            console.log("User already exists: ", userCredentials.uid); // Logging for clarity
            return { valid: false, message: 'User already exists' };
        }
        
        const hashedPassword = await bcrypt.hash(userCredentials.pwd, saltRounds);

        const result = await users.insertOne({
            uid: userCredentials.uid,
            pwd: hashedPassword, // Consider hashing the password before storing
            login_attempts: 0,
            last_login_attempt: 0
        });

        console.log("User created successfully: ", result); // Logging for clarity
        return { valid: true, message: 'User created successfully' };
    } catch (err) {
        console.error("Error creating user record: ", err); // More descriptive error logging
        return { valid: false, message: 'An error occurred' };
    } finally {
        await client.close();
    }
};

const _delete_user_record = () => {
    // return: true | false
    // remove user data
};

const _validate_user_credentials = async (req) => {
    try {
        const user_credentials = req.body;

        await client.connect();
        const users = client.db(database_name).collection('users');

        // Check for existing account
        const user = await users.findOne({ uid: user_credentials.uid });
        if ( ! user ) {
            return { valid: false, message: "Login failed: User does not exist" }; 
        }

        if ( Date.now() - user.last_login_attempt < 30 * 60 * 1000 ) { // 30 minute lockout time
            if ( user.login_attempts >= 5 ) {
                return { valid: false, message: "Account locked due to too many failed login attempts. Please try again later." };
            }
        } else {
            // Lockout time has passed, reset the attempts
            await users.updateOne({ uid: user_credentials.uid }, { $set: { login_attempts: 0 } });
        }

        // Validate password
        const is_password_valid = await bcrypt.compare(user_credentials.pwd, user.pwd);
        if ( is_password_valid ) {
            // login successful
            await users.updateOne({ uid: user_credentials.uid }, { $set: { login_attempts: 0 } });
            return { valid: true, message: "User credentials successfully validated" };
        }
        else {
            // Increment login attempts
            await users.updateOne({ uid: user_credentials.uid }, { $inc: { login_attempts: 1 }, $set: { last_login_attempt: Date.now() } });
            return { valid: false, message: `Login failed: ${5 - user.login_attempts} attempts remaining` };
        }
    }
    catch (err) {
        console.error(err);
        return { valid: false, message: "An error occurred during login" };
    }
    finally {
        await client.close();
    }
};

const _create_user_session = (req) => {
    req.session.uid = req.body.uid; // Assigning UID to the session
    req.session.save(); // Explicitly save the session
    return true;
};

const _delete_user_session = () => {
    // return: user session ID | false
    // delete user session on logout
};

const _is_user_authenticated = (req) => {
    // Check if the user ID is stored in the session
    return req.session.uid != undefined;
};

module.exports = {

    enforceSession: function (req, res, next) {
        if (_is_user_authenticated(req) == false) {
            const url = req.originalUrl == '/' ? 'home' : req.originalUrl;
            const encoded_redirect_url = encodeURIComponent(url);
            res.redirect(`/login?ref=${encoded_redirect_url}`);
        } else {
            next();
        }
    },

    enforceRole: function(requiredRoles) {
        return async (req, res, next) => {
            await client.connect();
            const users_collection = client.db(database_name).collection('users');
            const user = await users_collection.findOne({ uid: req.session.uid });
            if ( ! user.role ) {
                const url = req.originalUrl == '/' ? 'home' : req.originalUrl;
                const encoded_redirect_url = encodeURIComponent(url);
                res.redirect(`/login/role?ref=${encoded_redirect_url}`);
                return;
            }
            if ( ! req.session.role ) {
                req.session.role = user.role;
                req.session.save();
            }
            if (!user || ( requiredRoles.length > 0 && !requiredRoles.includes(user.role) ) ) {
                // If the user does not have one of the required roles, handle as needed
                // This could be redirecting to a login page, showing an error, etc.
                res.status(403).send('Access Denied: Insufficient privileges');
            } else {
                next(); // Proceed if the user has the required role
            }
        }
    },

    registerUserCredentials: async function (req) {
        // return: { valid, message }
        // check credentials and existing accounts, finally writing user record
        // email verification would go here, 2FA, etc.

        return _enforce_credential_requirements(req) == true
            ? await _create_user_record(req)
            : { valid: false, message: 'User credentials do not meet security requirements' };
    },

    authenticateUser: async function (req) {
        // Directly return the promise from _validate_user_credentials
        // This ensures that authenticateUser itself returns a promise
        const login_status = await _validate_user_credentials(req);
        if (login_status.valid == true) {
            _create_user_session(req);
            return login_status; // Return the login status object
        }
        else {
            return login_status; // Ensure to return login status even if validation fails
        }
    },

    setUserRole: async function (req) {
        // return: { valid, message }
        // set user role

        await client.connect();
        const users_collection = client.db(database_name).collection('users');
        console.log(req.body);
        return await users_collection.updateOne({ uid: req.session.uid }, { $set: { role: req.body.role } })
            .then(() => ({ valid: true, message: 'User role set successfully' }))
            .catch((err) => ({ valid: true, message: 'Error occured' }));
    },

    isUserAuthenticated: _is_user_authenticated

};
