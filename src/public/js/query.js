const _search_movie = async (title = '') => {
    return await fetch(`/api/movies/search?title=${title}`)
    .then(response => {
        console.log(response.status);
        return response.json();
    });
}

const _add_movie = (form_id) => {
    const form = new FormData(document.getElementById(form_id));
    fetch('/api/movies/add', {
        method: 'POST',
        body: form,
    })
    .then(response => {
        console.log(response.status);
    });
}
