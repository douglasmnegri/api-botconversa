// run-price.js
const Dinero = require("dinero.js");
const knex = require("knex");
const config = require("./knexfile");
const env =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const dbConnection = knex(config[env]);
// const SETUP = 30;
// const PROFIT = 0.6;

async function getPrice(id) {
  const shirts = await dbConnection("shirts").where("id", id).first();
  return shirts;
}

async function getSilkCosts() {
  try {
    let silkCosts = await dbConnection("silkScreenCosts")
      .orderBy("id", "desc")
      .first();
    return silkCosts;
  } catch (error) {
    console.error("Deu erro", error);
  }
}

async function customization(color) {
  let customCosts = await getSilkCosts();
  let print = parseFloat(customCosts.print);
  let screen = parseFloat(customCosts.screen); // Parse screen as a float

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

async function roundAndProfit(print, screen) {
  try {
    const customCosts = await getSilkCosts();
    const profit = customCosts.profit;

    const profitPrint = print / profit;
    const profitScreen = screen / profit;

    const roundPrint = Math.round(profitPrint * 100) / 100;
    const roundScreen = Math.round(profitScreen * 100) / 100;

    return [roundPrint, roundScreen];
  } catch (error) {
    console.error("Error in roundAndProfit function:", error);
    throw error;
  }
}

const customFront = async (colorFront) => {
  if (colorFront != 0) {
    const { print, screen } = await customization(colorFront);

    return roundAndProfit(print, screen);
  } else {
    return [0, 0];
  }
};

const customBack = async (colorBack) => {
  if (colorBack != 0) {
    const { print, screen } = await customization(colorBack);
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

async function calculateCustomPrice(receivedData) {
  const frontCustomization = await customFront(receivedData.colorFront);
  const backCustomization = await customBack(receivedData.colorBack);
  let customPriceFront = 0;
  let customPriceBack = 0;

  const customCosts = await getSilkCosts();
  const setup = customCosts.setup;

  if (!arrayEquals(frontCustomization, [0, 0])) {
    if (receivedData.shirtID == 108) {
      customPriceFront = 4;
    } else {
      customPriceFront =
        frontCustomization[1] +
        frontCustomization[0] / receivedData.shirtQuantity +
        setup / receivedData.shirtQuantity;
    }
  }

  if (!arrayEquals(backCustomization, [0, 0])) {
    customPriceBack =
      backCustomization[1] +
      backCustomization[0] / receivedData.shirtQuantity +
      setup / receivedData.shirtQuantity;
  }

  return customPriceBack + customPriceFront;
}

async function shirtAndCustom(receivedData) {
  if (!receivedData || isNaN(receivedData.shirtID)) {
    console.error("Invalid or missing shirt ID in receivedData.");
    return [0, 0];
  }

  let selectedShirt = await getPrice(receivedData.shirtID);
  let customPrice = await calculateCustomPrice(receivedData);
  const colorFront = parseInt(receivedData.colorFront);
  const colorBack = parseInt(receivedData.colorBack);

  function normalPrice() {
    let priceOverHundred = customPrice + parseFloat(selectedShirt.price);

    if (receivedData.shirtQuantity >= 100) {
      if (receivedData.shirtID == 108) {
        priceOverHundred -= 4;
      } else {
        priceOverHundred -= 2;
      }
    }

    function directToFilm(code) {
      let directToFilm = "";
      let priceOne = 0;
      let priceTwo = 0;

      switch (parseInt(code)) {
        case 108:
        case 106:
          priceOne = 42.0;
          priceTwo = 42.0;
          break;
        case 103:
          priceOne = 27.5;
          priceTwo = 40.5;
          break;
        case 107:
          priceOne = 34.0;
          priceTwo = 47.0;
          break;
        default:
          return null;
      }

      if (colorFront != 0 && colorBack != 0) {
        directToFilm = priceTwo;
      } else if (
        (colorFront != 0 && colorBack == 0) ||
        (colorFront == 0 && colorBack != 0)
      ) {
        directToFilm = priceOne;
      } else {
        directToFilm = null;
      }

      return directToFilm;
    }

    const DTF = directToFilm(receivedData.shirtID);
    const fixedPrice = Math.ceil(priceOverHundred * 2) / 2;
    return [fixedPrice, DTF];
  }

  function getFinalPrice() {
    const [fixedPrice, DTF] = normalPrice();
    const checkForValue = fixedPrice > DTF ? DTF : fixedPrice;
    const fixedCustom = checkForValue * receivedData.shirtQuantity;

    const finalPriceTotal = Dinero({ amount: fixedCustom * 100 })
      .setLocale("pt-BR")
      .toFormat("0,0.00");
    const unitPrice = checkForValue.toFixed(2).replace(/\./g, ",");

    return [unitPrice, finalPriceTotal, checkForValue];
  }

  const [unitPrice, finalPriceTotal, checkForValue] = getFinalPrice();

  function creditCardPrice() {
    let fixedCreditCardPrice = checkForValue;
    if (receivedData.shirtQuantity >= 100) {
      if (receivedData.shirtID == 108) {
        fixedCreditCardPrice += 4;
      } else {
        fixedCreditCardPrice += 2;
      }
    }

    const totalPrice = fixedCreditCardPrice * receivedData.shirtQuantity;

    
    const creditCardFinalPrice = Dinero({ amount: totalPrice * 100 })
      .setLocale("pt-BR")
      .toFormat("0,0.00");

    
    const creditCardUnitPrice = Dinero({ amount: fixedCreditCardPrice * 100 })
      .setLocale("pt-BR")
      .toFormat("0,0.00");

    console.log(creditCardUnitPrice);
    let installmentPrice, numberOfInstallments;
    for (let i = 10; i > 0; i--) {
      numberOfInstallments = i;
      installmentPrice = totalPrice / numberOfInstallments;
      if (installmentPrice >= 100) {
        break;
      }
    }

    const installmentPriceFixed = Math.round(installmentPrice * 100); // Ensure installmentPriceFixed is an integer
    const installmentValue = Dinero({ amount: installmentPriceFixed })
      .setLocale("pt-BR")
      .toFormat("0,0.00");
    return [numberOfInstallments, installmentValue, creditCardFinalPrice, creditCardUnitPrice];
  }

  const [numberOfInstallments, installmentPrice, creditCardFinalPrice, creditCardUnitPrice] =
    creditCardPrice();

  return [
    unitPrice,
    finalPriceTotal,
    numberOfInstallments,
    installmentPrice,
    creditCardFinalPrice,
    creditCardUnitPrice
  ];
}

function calculateShirtPrice(receivedData) {
  return shirtAndCustom(receivedData);
}

module.exports = {
  calculateShirtPrice,
};
