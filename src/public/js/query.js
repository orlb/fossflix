const _search_movie = async (title = '') => {
    return await fetch(`/api/movies/search?title=${title}`)
    .then(response => {
        console.log(response.status);
        return response.json();
    })
    .then(movies => {
        console.log(movies);
        return movies.length > 0 ? movies
        : [ {
            title: "No movies available",
            description: "Check back later"
        } ];
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

const _populate_movies_div = (element) => {
    _search_movie()
        .then(movies => movies.forEach(movie => {
                let date = new Date(movie.date);
                let movie_div = document.createElement('div');
                movie_div.classList.add('movie-div');
                movie_div.innerHTML = `
                    <a href="${movie.id ? '/movie/' + movie.id + '/video' : ''}">
                        <p>
                            <img src="${movie.id ? '/movie/' + movie.id + '/thumbnail' : '/image/thumbnail.jpeg' }"
                                width="256"
                                height="144"
                            />
                            <br>
                            ${movie.title}<br>
                            ${ movie.date ? 'Submitted ' + date.toLocaleDateString("en-US") : ''}
                        </p>
                    </a>
                `;
                element.appendChild(movie_div);
            })
        );
}
