/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Create the table
  await knex.schema.createTable("proposal_id", function (table) {
    table.increments("id").primary();
    table.string('phone').notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });

  // Set the starting value of the auto-incrementing id to 1000
  await knex.raw("ALTER SEQUENCE proposal_id_id_seq RESTART WITH 1000");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("proposal_id");
};
