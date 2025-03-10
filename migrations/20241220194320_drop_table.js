/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Drop the table if it exists
    await knex.schema.dropTableIfExists('custom_printing'); // dropTableIfExists to prevent errors if table doesn't exist
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function (knex) {
    // Recreate the table in case of rollback
    await knex.schema.createTable('custom_printing', function (table) {
      table.increments('id').primary();
      table.string('paper_size');
      table.decimal('sublimation');
      table.decimal('DTF');
      table.decimal('press');
    });
  };
  