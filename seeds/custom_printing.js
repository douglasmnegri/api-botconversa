/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('custom_printing').del();

  // Inserts new entries
  await knex('custom_printing').insert([
    { id: 1, paper_size: 'A4', sublimation: 2.50, "DTF": 12.00 }, // Use double quotes for "DTF"
    { id: 2, paper_size: 'A3', sublimation: 3.50, "DTF": 24.00 }, // Use double quotes for "DTF"
  ]);
};
