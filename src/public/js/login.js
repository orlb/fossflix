function submitLoginForm (action) {
    let form = document.getElementById('login_form');
    let a = document.createElement('input');
    a.name = action;
    form.appendChild(action);
    form = new FormData(form);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/login", true);
    //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(form);

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
