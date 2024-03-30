const config = require("config");
const { MongoClient } = require("mongodb");
const uri = config.get("mongodb_uri");
const database_name = config.get("mongodb_db");

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
            const result = await movies.deleteOne({ _id: _id });
            console.log(result);
            return 200; // 'No Content'
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
    }
};
