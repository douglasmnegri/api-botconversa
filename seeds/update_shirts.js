/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const shirts = [
    { id: 102, name: "Camiseta de Algodão Branca", price: 12.5 },
    { id: 103, name: "Camiseta de Algodão Colorida", price: 14.5 },
    { id: 104, name: "Camiseta Sublime Básica Branca", price: 10.5 },
    { id: 105, name: "Camiseta Sublime Premium Branca", price: 11 },
    { id: 106, name: "Camiseta Sublime Premium Colorida", price: 12 },
    { id: 107, name: "Camiseta de Algodão Penteado Branca", price: 21.5 },
    { id: 108, name: "Camiseta de Algodão Penteado Preta", price: 23 }
  ];

  for (const shirt of shirts) {
    const existingShirt = await knex('shirts').where('id', shirt.id).first();

    if (existingShirt) {
      await knex('shirts').where('id', shirt.id).update(shirt);
    } else {
      await knex('shirts').insert(shirt);
    }
  }
};
