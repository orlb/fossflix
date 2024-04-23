# Fossflix

Welcome to **Fossflix**, a web-based platform designed to share and discover free and open-source software (FOSS) related videos. Our platform aims to create a community-driven space where users can engage with educational content, tutorials, and discussions around FOSS projects and technologies.

## Features

Fossflix offers a variety of features tailored to enhance user experience and content accessibility:

- **User Authentication**: Secure login and registration system, allowing users to access personalized features based on their roles.
- **Content Discovery**: Viewers can explore a wide range of videos through keyword and genre-based search functionalities.
- **Movie Management**: Editors have the ability to upload, delete, and edit movie entries, including adding detailed descriptions and tags for easier discovery.
- **User Roles and Permissions**: Differentiated access control for viewers, editors, marketing managers, and administrators, ensuring a tailored user experience.
- **Interactive Engagement**: Users can like movies and leave comments, fostering an interactive community.

## Installation

To set up Fossflix on your local machine, follow these steps:

### Prerequisites

Ensure you have the following installed:
- Node.js
- npm (Node Package Manager)
- MongoDB
- ffmpeg (for video processing)

### Steps

1. Clone the repository:

`git clone https://github.com/orlb/fossflix`

2. Navigate to the cloned directory:

`cd fossflix`

3. Install the required Node.js packages:

`npm install`

4. Configure your environment variables in `config/default.json` to match your local setup, especially the MongoDB URI.

5. Start the server:

`npm run test`


Your local instance of Fossflix should now be running and accessible at `http://localhost:8443` (or whichever port you configured).

## Docker Install

Setup via docker-compose

### Prerequisites

Ensure you have the following installed:
- Docker
- Docker-compose

### Steps

1. Start the docker service:

`sudo systemctl start docker`

2. Clone the repository:

`git clone https://github.com/orlb/fossflix`

3. Navigate to the cloned directory:

`cd fossflix`

4. Build and run the fossflix image via docker-compose:

`sudo docker-compose up`

Your local instance of Fossflix should now be running and accessible at `http://localhost:8443`.
