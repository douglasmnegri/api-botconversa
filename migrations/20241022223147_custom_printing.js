/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("custom_printing", function (table) {
      table.increments("id").primary();
      table.string("paper_size").notNullable(); 
      table.decimal("sublimation").notNullable();
      table.decimal("DTF").notNullable(); 
      table.timestamp("createdAt").defaultTo(knex.fn.now());
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.dropTable("custom_printing");
  };
  