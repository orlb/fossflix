const config = require("config");
const { MongoClient } = require("mongodb");
const uri = config.get("mongodb_uri");
const database_name = config.get("mongodb_db");

const { promises: fs } = require('fs');
const path = require('path');

const client = new MongoClient(uri);
const database = client.db(database_name);
const movies = database.collection("movies");
const users = database.collection("users");

module.exports = {

    getMovie: async (_id) => {
        try {
            await client.connect();
            return _id ? await movies.findOne({ _id: _id }) : {};
        }
        catch (err) {
            console.log(err);
        }
        finally {
            await client.close();
        }
    },

    searchMovie: async (title, sort) => {
        try {
            await client.connect();
            const query = title ? { title: { $regex: title, $options: "i" } } : {};
            return await movies.find(query).sort({ [sort]: -1 }).toArray();
        }
        catch (err) {
            console.log(err);
        }
        finally {
            await client.close();
        }
    },

    addMovie: async (_id, metadata) => {
        try {
            await client.connect();
            const result = await movies.insertOne(
                {
                    _id: _id,
                    title: metadata.title,
                    description: metadata.description,
                    date: Date.now(),
                    tags: metadata.tags,
                    likes: []
                },
                { ignoreUndefined: true }
            );
            console.log(result);
            return { code: 201 };
        }
        catch (err) {
            console.log(err);
        }
        finally {
            await client.close();
        }
    },

    removeMovie: async (_id) => {
        try {
            await client.connect();
            const movie = await movies.findOne({ _id: _id });
            if (!movie) {
                console.log(`No movie found with ID: ${_id}`);
                return { code: 404, message: 'Movie not found' };
            }
            
            // Delete the MongoDB document
            const result = await movies.deleteOne({ _id: _id });
            
            // Define the paths for the movie and its thumbnail
            const moviePath = path.join(path.dirname(require.main.filename), './upload/movie', _id);
            const thumbnailPath = path.join(path.dirname(require.main.filename), './upload/thumbnail', _id + '.png');
        
            // Delete the movie file
            await fs.unlink(moviePath).catch(err => console.error(`Failed to delete movie file: ${err.message}`));
        
            // Delete the thumbnail file
            await fs.unlink(thumbnailPath).catch(err => console.error(`Failed to delete thumbnail file: ${err.message}`));
        
            console.log(`Successfully deleted movie with ID: ${_id}`);
            return { code: 200, message: 'Movie and associated files successfully deleted' };
        } catch (err) {
            console.error(`Error deleting movie with ID ${_id}:`, err);
            return { code: 500, message: `Error deleting movie: ${err.message}` };
        } finally {
            await client.close();
        }
    },

    updateMovie: async (_id, metadata) => {
        try {
            await client.connect();

            // Add a check to ensure metadata is not null and is an object
            if (!metadata || typeof metadata !== 'object' || Object.keys(metadata).length === 0) {
                console.log(`Update aborted: metadata is invalid. Received:`, metadata);
                return { code: 400, message: 'Invalid metadata for update' };
            }

            const result = await movies.updateOne({ _id: _id }, { $set: metadata });
            if (result.matchedCount === 0) {
                console.log(`No matching movie found for update with ID: ${_id}`);
                return { code: 404, message: 'Movie not found' };
            } else {
                console.log(`Movie updated with ID: ${_id}, Metadata:`, metadata);
                return { code: 200, message: 'Movie updated successfully', record: result };
            }
        } catch (err) {
            console.error(`Error updating movie with ID ${_id}:`, err);
            return { code: 500, message: `Error updating movie: ${err.message}` };
        } finally {
            await client.close();
        }
    },

    toggleLike: async (movieId, userId) => {
        await client.connect();
        const movie = await movies.findOne({ _id: movieId });
    
        if (movie.likes.includes(userId)) {
            // User already liked the movie, so unlike it
            await movies.updateOne({ _id: movieId }, { $pull: { likes: userId } });
            return { liked: false };
        } else {
            // User hasn't liked the movie, so like it
            await movies.updateOne({ _id: movieId }, { $addToSet: { likes: userId } });
            return { liked: true };
        }
    }
};
