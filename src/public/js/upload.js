document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('movie_upload_form');
    const uploadStatus = document.querySelector('.upload-status');
    const progressBarFill = document.querySelector('.progress-bar-fill');

    form.onsubmit = function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', form.action, true);

        // Unhide the progress bar and uploading text
        uploadStatus.classList.remove('hidden');

        // Listen to the 'progress' event
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentage = (e.loaded / e.total) * 100;
                progressBarFill.style.width = percentage + '%';
            }
        };

        xhr.onload = function() {
            if (xhr.status === 201) {
                alert('Upload successful');
                progressBarFill.style.width = '0%'; // Reset the progress bar
                uploadStatus.classList.add('hidden'); // Hide the progress bar and text
            } else {
                alert('Upload failed');
                uploadStatus.classList.add('hidden'); // Hide the progress bar and text
            }
        };

        xhr.send(formData);
    };
});
