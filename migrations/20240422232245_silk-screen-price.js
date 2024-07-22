/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('silkScreenCosts', function(table) {
      table.increments('id').primary();
      table.decimal('print').notNullable();
      table.decimal('screen').notNullable();
      table.decimal('setup').notNullable();
      table.decimal('profit').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('shirtsCosts');
  };
  