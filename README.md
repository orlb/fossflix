# Fossflix

Welcome to **Fossflix**, a web-based platform designed to share and discover free and open-source software (FOSS) related videos. Our platform aims to create a community-driven space where users can engage with educational content, tutorials, and discussions around FOSS projects and technologies.

## Features

Fossflix offers a variety of features tailored to enhance user experience and content accessibility:

- **User Authentication**: Secure login and registration system, allowing users to access personalized features based on their roles.
- **Content Discovery**: Viewers can explore a wide range of videos through keyword and genre-based search functionalities.
- **Movie Management**: Editors have the ability to upload, delete, and edit movie entries, including adding detailed descriptions and tags for easier discovery.
- **User Roles and Permissions**: Differentiated access control for viewers, editors, marketing managers, and administrators, ensuring a tailored user experience.
- **Interactive Engagement**: Users can like movies and leave comments, fostering an interactive community.
- **Accessibility Features**: Keyboard navigation and screen reader support to ensure accessibility for all users.

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


Your local instance of Fossflix should now be running and accessible at `http://localhost:3000` (or whichever port you configured).

## Usage

After installation, you can interact with Fossflix through its web interface:

- **Home Page**: Discover the latest movies added to Fossflix.
- **Search**: Use the search bar to find movies by keywords or genres.
- **Upload Content**: Editors can upload new movies via the "Edit" section.
- **User Registration and Login**: Access personalized features by signing up and logging in.