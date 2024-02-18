/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('shirts').insert([
    {id: 102, name: "Camiseta de Algodão Branca", price: 10.5},
    {id: 103, name: "Camiseta de Algodão Colorida", price: 12.5},
    {id: 104, name: "Camiseta Sublime Básica Branca", price: 8.5},
    {id: 105, name: "Camiseta Sublime Premium Branca", price: 9},
    {id: 106, name: "Camiseta Sublime Premium Colorida", price: 10},
    {id: 107, name: "Camiseta de Algodão Penteado Branca", price: 19.5},
    {id: 108, name: "Camiseta de Algodão Penteado Preta", price: 21}
  ]);
};
