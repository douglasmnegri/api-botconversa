/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up =  function(knex) {
    return knex.schema.createTable('shirts', function (table) {
        table.integer('id').primary().notNullable(); // Primary key field without auto-increment
        table.string('name').notNullable();
        table.decimal('price', 10, 2).notNullable(); // Price field as a decimal with precision 10 and scale 2
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
  };