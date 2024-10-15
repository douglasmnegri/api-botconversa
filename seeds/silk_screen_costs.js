/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('silkScreenCosts').del();

  // Inserts new entries
  await knex('silkScreenCosts').insert([
    { id: 1, print: 45, screen: 1, setup: 30, profit: 60 },
    // Add more entries as needed
  ]);
};
