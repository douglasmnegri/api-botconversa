const knex = require("knex");
const config = require("./knexfile");
const env = process.env.NODE_ENV !== "production" ? "development" : "production";
const dbConnection = knex(config[env]);

async function getPrice(id) {
  const shirts = await dbConnection("shirts").where("id", id).first();
  return shirts;
}

async function getPrintingPrice(id) {
  const printingPrice = await dbConnection("custom_printing")
    .where("id", id)
    .first();
  return printingPrice;
}

async function calculatePolyesterPrice(receivedData) {
  const selectedShirt = await getPrice(receivedData.shirtID);
  const frontCustom = await getPrintingPrice(receivedData.customFront);
  const backCustom = await getPrintingPrice(receivedData.customBack);
  
  const shirtSum = Number(backCustom.sublimation) + Number(frontCustom.sublimation);
  console.log(shirtSum)

  return [selectedShirt, frontCustom];
}

(async () => {
  const receivedData = { shirtID: 105, customFront: 1, customBack: 2 }; // Replace with actual data
  try {
    const prices = await calculatePolyesterPrice(receivedData);
    console.log('Prices:', prices);
  } catch (error) {
    console.error('Error calculating prices:', error);
  } finally {
    await dbConnection.destroy(); // Close the database connection
  }
})();
