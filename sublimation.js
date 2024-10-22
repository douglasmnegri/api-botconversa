const Dinero = require("dinero.js");
const knex = require("knex");
const config = require("./knexfile");
const env =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const dbConnection = knex(config[env]);

async function getPrice(id) {
  const shirts = await dbConnection("shirts").where("id", id).first();
  return shirts;
}

async function calculatePolyesterPrice(receivedData) {
    const selectedShirt = await getPrice(receivedData.shirtID);
}