/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.dropTableIfExists("silkScreenCosts");

  await knex("custom_printing").where({ id: 1 }).update({ press: 1 });
  await knex("custom_printing").where({ id: 2 }).update({ press: 1 });
  await knex("custom_printing").insert([
    { paper_size: "A4", sublimation: 2, DTF: 13, press: 1 },
    { paper_size: "A3", sublimation: 3, DTF: 25, press: 1 },
  ]);

  await knex.schema.createTable("silk_screen_costs", function (table) {
    table.increments("id").primary();
    table.decimal("print").notNullable();
    table.decimal("screen").notNullable();
    table.decimal("setup").notNullable();
    table.decimal("profit").notNullable();
    table.decimal("ink").notNullable();
    table.decimal("press").notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("silk_screen_costs");
  await knex("custom_printing").whereIn("paper_size", ["A4", "A3"]).del();
  await knex("custom_printing").where({ id: 1 }).update({ press: null });
  await knex("custom_printing").where({ id: 2 }).update({ press: null });
};
