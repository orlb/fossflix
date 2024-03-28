const config = require("config");
const { MongoClient } = require("mongodb");
const uri = config.get("mongodb_uri");
const database_name = config.get("mongodb_db");

const client = new MongoClient(uri);
const database = client.db(database_name);
const movies = database.collection("movies");
const users = database.collection("users");



const searchMovie = async (title, sort) => {
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
};

const addMovie = async (id, metadata) => {
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
};

const removeMovie = async (id) => {
    try {
        await client.connect();
        await movies.deleteOne({ id: id });
        return 204; // 'No Content'
    } finally {
        await client.close();
    }
};

const updateMovie = async (movieId, metadata) => {
    try {
        await client.connect();
        const result = await movies.updateOne({ _id: new MongoClient.ObjectID(movieId) }, { $set: metadata });
        return { code: 200, record: result.ops[0] }; // In practice, we should return the updated document
    } finally {
        await client.close();
    }
};

module.exports = {
	getUsers: function (index) {
	    let query = { fname: index };
		let users = {}
		let result_set = connection.find(query);
		return result_set;
	},

	close: async function () {
	    await client.close();
	},

    searchMovie,
    addMovie,
    removeMovie,
    updateMovie
};
