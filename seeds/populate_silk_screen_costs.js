/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("silk_screen_costs").insert([
    { print: 45, screen: 2, setup: 60, profit: 0.6, ink: 0.2, press: 0.5 },
    { print: 45, screen: 1, setup: 50, profit: 0.6, ink: 0.1, press: 0.5 },
  ]);
};
