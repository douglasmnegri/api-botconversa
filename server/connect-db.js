const knex = require("knex");
const config = require("../knexfile");
const env =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const dbConnection = knex(config[env]);

async function getPrice(id) {
  const shirts = await dbConnection("shirts").where("id", id).first();
  return shirts;
}

async function getSilkCosts(id) {
  try {
    let silkCosts = await dbConnection("silk_screen_costs")
      .where("id", id)
      .first();

    return silkCosts;
  } catch (error) {
    console.error("Erro: ", error);
  }
}

async function getDTFCost() {
  try {
    const sheet = await dbConnection("custom_printing").first();
    return sheet;
  } catch (error) {
    console.error("Erro: ", error);
  }
}

async function getPress() {
  try {
    const press = await dbConnection("custom_printing").select("press").first();
    return press;
  } catch (error) {
    console.error("Erro: ", error);
  }
}

async function getURL(pdf_id) {
  try {
    const pdf = await dbConnection("proposal_id")
      .select("pdf_url", "createdAt")
      .where("id", pdf_id);
    console.log(pdf);
    return pdf;
  } catch (error) {
    console.error("Erro: ", error);
  }
}

module.exports = {
  getPrice,
  getSilkCosts,
  getDTFCost,
  getPress,
  getURL,
};
