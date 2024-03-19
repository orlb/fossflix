function enforceCredentialRequirements () {
    // return: { valid, messages }

    let form = document.getElementById('login_form').cloneNode(true);
    let user_credentials = {};

    (new FormData(form)).forEach((v, k) => user_credentials[k] = v);

    let requirement_status = { messages: [] };
    requirement_status.valid = true;

    if ( ! (user_credentials.uid.length >= 4) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Username must be 4 or more characters long");
    }
    if ( ! (/[a-z]/.test(user_credentials.uid)) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Username must include a lowercase letter");
    }
    if ( ! (/[_]/.test(user_credentials.uid)) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Username must include an underscore character");
    }
    if ( /[A-Z]/.test(user_credentials.uid) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Username must not include any uppercase letters");
    }
    if ( /[\.\@\#\%\&\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:\-]/.test(user_credentials.uid) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Username must not include any special characters");
    }
    if ( ! (user_credentials.pwd.length >= 8 )) {
        requirement_status.valid = false;
        requirement_status.messages.push("Password must be 8 or more characters long");
    }
    if ( ! (/[a-z]/.test(user_credentials.pwd)) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Password must include a lowercase letter");
    }
    if ( ! (/[A-Z]/.test(user_credentials.pwd)) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Password must include an uppercase letter");
    }
    if ( ! (/[\_\@\#\%\&\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:\-]/.test(user_credentials.pwd)) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Password must include one special character");
    }
    if ( /[\.]/.test(user_credentials.pwd) ) {
        requirement_status.valid = false;
        requirement_status.messages.push("Password must not include any periods");
    } 
    
    return requirement_status;
}

function updateRequirementsDiv () {
    let credential_requirements_div = document.getElementById('credential_requirements');
    credential_requirements_div.innerHTML = '';

    let credential_requirements = enforceCredentialRequirements();

    for ( const message of credential_requirements.messages ) {
        let p = document.createElement('p');
        p.innerHTML = message;
        credential_requirements_div.appendChild(p);
    }
}

function submitLoginForm (action) {
    // post login_form input as json to /login
    let form = document.getElementById('login_form').cloneNode(true);
    let o = {};

    (new FormData(form)).forEach((v, k) => o[k] = v);
    o['action'] = action;
    o = JSON.stringify(o);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(o);

    xhr.onload = () => {
        let login_status = JSON.parse(JSON.parse(xhr.responseText));

        if ( xhr.status == '200' ) {
            alert(`Success: ${login_status['valid']}\nMessage: ${login_status['message']}`);
            if ( action == 'login' ) {
                // redirect to url encoded ref
                let url_params = (new URLSearchParams(new URL(location.href).search));

                if ( url_params.has('ref') ) {
                    window.location.href = decodeURIComponent(url_params.get('ref'));
                }
                else {
                    window.location.href = '/home';
                }
            }
            else {
                document.getElementById('uid').value = '';
                document.getElementById('pwd').value = '';
            }
        }
        else if ( xhr.status == '400' ) {
            alert(`Success: ${login_status['valid']}\nMessage: ${login_status['message']}`);
        }
    }
}

function updateMovie (action) {
}
