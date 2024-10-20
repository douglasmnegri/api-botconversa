const express = require("express");
const router = express.Router();
const knex = require("knex");
const config = require("./knexfile");
const env =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const dbConnection = knex(config[env]);

router.get("/", async (req, res) => {
  const configs = await dbConnection("shirtsCosts");
  res.send({ configs });
});

router.post("/", async (req, res) => {
  const requestConfig = req.body;
  await dbConnection("shirtsCosts").insert({
    print: requestConfig.print,
    screen: requestConfig.screen,
    setup: requestConfig.setup,
    profit: requestConfig.profit,
  });
  res.sendStatus(204);
});

module.exports = {
  router,
};
