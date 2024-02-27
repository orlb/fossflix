const config = require("config");
const { MongoClient } = require("mongodb");
const uri = config.get("mongodb_uri");
const database = config.get("mongodb_db");

const client = new MongoClient(uri);
const database = client.db(database);
const movies = database.collection("users");

async function queryDatabase(query) {
  try {
    let fieldName = "fname";

    let result_set = await movies.distinct(fieldName, query);
    return result_set;
  } finally {
	  console.log("query failed");
  }
}

return {
	getUsers = function (index) {
	    let query = { fname: index };
		let users = {
		}
		let result_set = connection.find(query);
		return result_set;
	},

	close = function () {
	    await client.close();
	}
};
