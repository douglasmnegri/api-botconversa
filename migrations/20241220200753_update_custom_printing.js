/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Create the table if it doesn't exist already
    await knex.schema.createTableIfNotExists('custom_printing', function (table) {
      table.increments('id').primary();
      table.string('paper_size');
      table.decimal('sublimation');
      table.decimal('DTF');
      table.decimal('press');
    });
  
    // Insert default data into the table
    await knex('custom_printing').insert([
      { paper_size: 'A4', sublimation: 2.50, DTF: 13 },
      { paper_size: 'A3', sublimation: 3.50, DTF: 25 },
    ]);
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function (knex) {
    // Drop the table if rolling back
    await knex.schema.dropTableIfExists('custom_printing');
  };
  