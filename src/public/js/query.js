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
    })
    .catch(err => {
        console.log(err);
        location.reload(); // weird "Mongo server is closed" error here sometimes
    });
};


const _add_movie = (form_id) => {
    const form = new FormData(document.getElementById(form_id));
    fetch('/api/movies/add', {
        method: 'POST',
        body: form,
    })
    .then(response => response.json()) // Parse JSON response
    .then(data => {
        // Check if upload was successful
        if (data.code === 201) {
            alert('Movie successfully uploaded!');
        } else {
            alert('Failed to upload movie. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during the upload. Please try again.');
    });
};


const _delete_movie = (movie_id) => {
    confirm(`Delete movie ${movie_id}?`) && fetch(`/api/movies/delete/${movie_id}`, {
        method: 'DELETE'
    })
    .then(response => {
        console.log(response.status);
    });
};

const _update_movie = (movie_id, formData) => {
    fetch(`/api/movies/update/${movie_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            console.log(data.message);
        } else {
            console.log(`Error updating movie: ${data.message}`);
        }
    })
    .catch(err => {
        console.error('Error updating movie:', err);
    });
};


function _update_movie_from_form() {
    const form = document.getElementById('movie_edit_form');
    const id = form.querySelector('input[name="_id"]').value;
    const title = form.querySelector('input[name="title"]').value;
    const description = form.querySelector('textarea[name="description"]').value;
    const tags = form.querySelector('input[name="tags"]').value.split(',').map(tag => tag.trim());

    // Ensure we're creating an object with the metadata property
    const updateData = {
        metadata: {
            title,
            description,
            tags
        }
    };

    _update_movie(id, updateData);
    return true;
}

const _populate_movies_div = (movies_element, movie_id = '') => {
    _search_movie(movie_id)
        .then(movies => {
            let movie_divs = [];
            movies.forEach(movie => {
                let movie_div = document.createElement('div');
                movie_div.classList.add('movie-div');
                movie_div.innerHTML = `
                    <a href="${movie._id ? '/watch/' + movie._id : ''}">
                        <p>
                            <img src="${movie._id ? '/thumbnail/' + movie._id + '.png' : '/image/thumbnail.jpeg'}"
                                width="256"
                                height="144"
                            />
                            <br>
                            ${movie.title}<br>
                            ${movie.date ? 'Submitted ' + new Date(movie.date).toLocaleDateString("en-US") : ''}
                        </p>
                    </a>
                `;
                movie_divs.push(movie_div);
            });
            movies_element.innerHTML = '';
            movie_divs.forEach(movie_div => movies_element.appendChild(movie_div));
        });
};

const _fill_movie_form = (movie_object, form_element) => {
    console.log(form_element);
    const skipFields = ['date', 'likes', 'views', 'comments']; // Fields to skip
    for (let field of Object.keys(movie_object)) {
        if (skipFields.includes(field)) continue; // Skip this iteration if field should be skipped
        console.log(field);
        try {
            let form_input_field = form_element.querySelector(
                `input[name=${field}], textarea[name=${field}]`
            );
            if (form_input_field) {
                form_input_field.value = movie_object[field];
            } else {
                console.warn(`Form field not found for: ${field}`);
            }
        } catch (e) {
            console.log(e);
        }
    }

    const commentsSection = document.getElementById('commentsSection');
    commentsSection.innerHTML = ''; // Clear previous comments

    if (movie_object.comments && movie_object.comments.length > 0) {
        movie_object.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            commentDiv.innerHTML = `<strong>${comment.username}:</strong> ${comment.text}`;
            commentsSection.appendChild(commentDiv);
        });
    } else {
        commentsSection.textContent = 'No comments';
    }
};



const _populate_edit_movies_div = (movies_element, form_element, click_callback = _fill_movie_form) => {
    movies_element.innerHTML = '';
    _search_movie()
        .then(movies => movies.forEach(movie => {
            let movie_div = document.createElement('div');
            movie_div.id = movie._id;
            movie_div.classList.add('movie-div');
            let movie_button = document.createElement('button');
            movie_button.onclick = () => {click_callback(movie, form_element)}; // function that calls callback
            movie_button.classList.add('colo-none');
            movie_button.innerHTML = `
                <p>
                    <img src="${movie._id ? '/thumbnail/' + movie._id + '.png' : '/image/thumbnail.jpeg'}"
                        width="256"
                        height="144"
                    />
                    <br>
                    ${movie.title}<br>
                    ${movie.date ? 'Submitted ' + new Date(movie.date).toLocaleDateString("en-US") : ''}
                </p>
            `;
            movie_div.appendChild(movie_button);
            movies_element.appendChild(movie_div);
        }));
};

const _delete_movie_from_form = (form_element) => {
    const movie_id = form_element.querySelector('input[name=_id]');
    _delete_movie(movie_id.value);
    return true;
};

const _toggle_like = (movie_id) => {
    fetch(`/api/movies/like/${movie_id}`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        const likeButton = document.getElementById(`like-btn-${movie_id}`);
        location.reload();
        // if (data.liked) {
        // // Update the like button to reflect the liked state
        //     likeButton.innerText = 'Unlike';
        //     likeButton.classList.add('liked');
        // } else {
        //     // Update the like button to reflect the unliked state
        //     likeButton.innerText = 'Like';
        //     likeButton.classList.remove('liked');
        // }
        // console.log('lol');
    })
    .catch(error => console.error('Error toggling like:', error));
};