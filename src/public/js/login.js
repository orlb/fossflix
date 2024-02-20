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
        if ( xhr.status == '200' ) {
            console.log(action + ' successful')
            /*
            if ( req.query.ref ) {
                let decoded_redirect_url = decodeURIComponent(req.query.ref);
                window.location.href = `${decoded_redirect_url}`;
            }
            else {
                res.redirect(`/`);
            }
            */
        }
        else if ( xhr.status == '400' ) {
            console.log(action + ' unsuccessful')
        }
    }
}
