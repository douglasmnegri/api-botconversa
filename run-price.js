// run-price.js
const { development: dbConfig } = require("./knexfile");
const knex = require("knex");
const dbConnection = knex(dbConfig);
const SETUP = 30;
const PROFIT = 0.6;

async function getPrice(id) {
  const shirts = await dbConnection("shirts").where("id", id).first();
  return shirts;
}

const shirtsData = [
  { id: 102, name: "Camiseta de Algodão Branca", price: 10.5 },
  { id: 103, name: "Camiseta de Algodão Colorida", price: 12.5 },
  { id: 104, name: "Camiseta Sublime Básica Branca", price: 8.5 },
  { id: 105, name: "Camiseta Sublime Premium Branca", price: 9 },
  { id: 106, name: "Camiseta Sublime Premium Colorida", price: 10 },
  { id: 107, name: "Camiseta de Algodão Penteado Branca", price: 19.5 },
  { id: 108, name: "Camiseta de Algodão Penteado Preta", price: 21 },
];

function customization(color) {
  let screen = 1;
  let print = 45;

  for (let i = 0; i < color - 1; i++) {
    print += 45;

    if (color <= 5) {
      screen += 0.07;
    } else {
      screen += 0.106;
    }
  }

  switch (color) {
    case 7:
      screen += 0.045;
      break;

    case 8:
      screen += 0.09;
      break;

    case 9:
      screen += 0.13;
      break;

    case 10:
      screen += 0.175;
      break;

    default:
      break;
  }

  return { print, screen };
}

const roundAndProfit = (print, screen) => {
  const profitPrint = print / PROFIT;
  const profitScreen = screen / PROFIT;

  const roundPrint = Math.round(profitPrint * 100) / 100;
  const roundScreen = Math.round(profitScreen * 100) / 100;

  return [roundPrint, roundScreen];
};

const customFront = (colorFront) => {
  if (colorFront != 0) {
    const { print, screen } = customization(colorFront);
    return roundAndProfit(print, screen);
  } else {
    return [0, 0];
  }
};

const customBack = (colorBack) => {
  if (colorBack != 0) {
    const { print, screen } = customization(colorBack);
    return roundAndProfit(print, screen);
  } else {
    return [0, 0];
  }
};

function arrayEquals(arr1, arr2) {
  return (
    Array.isArray(arr1) &&
    Array.isArray(arr2) &&
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}

function calculateCustomPrice(receivedData) {
  const frontCustomization = customFront(receivedData.colorFront);
  const backCustomization = customBack(receivedData.colorBack);
  let customPriceFront = 0;
  let customPriceBack = 0;

  if (!arrayEquals(frontCustomization, [0, 0])) {
    customPriceFront =
      frontCustomization[1] +
      frontCustomization[0] / receivedData.shirtQuantity +
      SETUP / receivedData.shirtQuantity;
  }

  if (!arrayEquals(backCustomization, [0, 0])) {
    customPriceBack =
      backCustomization[1] +
      backCustomization[0] / receivedData.shirtQuantity +
      SETUP / receivedData.shirtQuantity;
  }

  return customPriceBack + customPriceFront;
}

async function shirtAndCustom(receivedData) {
  if (!receivedData || isNaN(receivedData.shirtID)) {
    console.error("Invalid or missing shirt ID in receivedData.");
    return [0, 0];
  }

  let selectedShirt = await getPrice(receivedData.shirtID);
  let customPrice = calculateCustomPrice(receivedData);
  const colorFront = parseInt(receivedData.colorFront);
  const colorBack = parseInt(receivedData.colorBack);

  console.log(colorFront, colorBack);
  console.log(receivedData);

  if (selectedShirt) {
    console.log(selectedShirt);
    customPrice += parseFloat(selectedShirt.price);
  }

  if (receivedData.shirtQuantity < 100) {
    customPrice += 2;
  }

  const roundedCustom = Math.ceil(customPrice * 2) / 2;
  const fixedCustom = (roundedCustom * receivedData.shirtQuantity)
    .toFixed(2)
    .replace(/\./g, ",");
  const finalPrice = roundedCustom.toFixed(2).replace(/\./g, ",");
  let directToFilm = "";

  if (colorFront !== 0 && colorBack !== 0 && roundedCustom > 43) {
    directToFilm = "Oferta43";
  } else if (colorFront === 0 && colorBack > 0 && roundedCustom > 31) {
    directToFilm = "Oferta31";
  }
  else if (colorFront !== 0 && colorBack === 0 && roundedCustom > 31) {
    directToFilm = "Oferta31";
  } else {
    directToFilm = null;
  }

  return [finalPrice, fixedCustom, directToFilm];
}

function calculateShirtPrice(receivedData) {
  return shirtAndCustom(receivedData);
}

module.exports = {
  calculateShirtPrice,
};
