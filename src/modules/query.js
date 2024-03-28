const config = require("config");
const { MongoClient } = require("mongodb");
const uri = config.get("mongodb_uri");
const database_name = config.get("mongodb_db");

const client = new MongoClient(uri);
const database = client.db(database_name);
const movies = database.collection("movies");
const users = database.collection("users");

module.exports = {

    getMovie: async (id) => {
        try {
            await client.connect();
            return id ? await movies.findOne({ id: id }) : {};
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

    addMovie: async (id, metadata) => {
        try {
            await client.connect();
            const result = await movies.insertOne(
                {
                    id: id,
                    title: metadata.title,
                    description: metadata.description,
                    date: Date.now(),
                    tags: metadata.tags,
                    likes: 0
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

    removeMovie: async (id) => {
        try {
            await client.connect();
            const result = await movies.deleteOne({ id: id });
            console.log(result);
            return 200; // 'No Content'
        } finally {
            await client.close();
        }
    },

    updateMovie: async (id, metadata) => {
        try {
            await client.connect();
            const result = await movies.updateOne({ id: id }, { $set: metadata });
            return { code: 200, record: result.ops[0] }; // In practice, we should return the updated document
        } finally {
            await client.close();
        }
    }
};
