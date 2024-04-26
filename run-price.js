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
  let silkCosts = await dbConnection("silkScreenCosts")
    .orderBy("id", "desc")
    .first();
  return silkCosts;
}

async function customization(color) {
  let customCosts = await getSilkCosts();
  let print = customCosts.print;
  let screen = parseFloat(customCosts.screen); // Parse screen as a float

  console.log("Print:", print);
  console.log("Screen:", screen);

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

const customFront = async (colorFront) => {
  if (colorFront != 0) {
    const { print, screen } = await customization(colorFront);
    console.log("Print:", print);
    console.log("Screen:", screen);
    return roundAndProfit(print, screen);
  } else {
    return [0, 0];
  }
};

const customBack = async (colorBack) => {
  if (colorBack != 0) {
    const { print, screen } = await customization(colorBack);
    console.log("Print:", print);
    console.log("Screen:", screen);
    return roundAndProfit(print, screen);
  } else {
    return [0, 0];
  }
};

async function roundAndProfit(print, screen) {
  try {
    const customCosts = await getSilkCosts();
    const profit = customCosts.profit;

    const profitPrint = print / profit;
    const profitScreen = screen / profit;

    const roundPrint = Math.round(profitPrint * 100) / 100;
    const roundScreen = Math.round(profitScreen * 100) / 100;

    console.log("Round Print:", roundPrint);
    console.log("Round Screen:", roundScreen);
    return [roundPrint, roundScreen];
  } catch (error) {
    console.error("Error in roundAndProfit function:", error);
    throw error;
  }
}

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

  console.log("Front Custom:", frontCustomization);
  console.log("Back Custom:", backCustomization);

  const customCosts = await getSilkCosts();
  const setup = customCosts.setup;

  if (!arrayEquals(frontCustomization, [0, 0])) {
    customPriceFront =
      frontCustomization[1] +
      frontCustomization[0] / receivedData.shirtQuantity +
      setup / receivedData.shirtQuantity;
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
    if (selectedShirt) {
      customPrice += parseFloat(selectedShirt.price);
    }

    let priceOverHundred = customPrice;
    if (receivedData.shirtQuantity >= 100) {
      priceOverHundred -= 2;
    }

    const roundedCustom = Math.ceil(priceOverHundred * 2) / 2;
    const fixedCustom = roundedCustom * receivedData.shirtQuantity * 100;

    const finalCustom = Dinero({ amount: fixedCustom })
      .setLocale("pt-BR")
      .toFormat("0,0.00");
    const finalPrice = roundedCustom.toFixed(2).replace(/\./g, ",");
    let directToFilm = "";

    if (colorFront !== 0 && colorBack !== 0 && roundedCustom > 43) {
      directToFilm = "Oferta43";
    } else if (colorFront === 0 && colorBack > 0 && roundedCustom > 31) {
      directToFilm = "Oferta31";
    } else if (colorFront !== 0 && colorBack === 0 && roundedCustom > 31) {
      directToFilm = "Oferta31";
    } else {
      directToFilm = null;
    }

    return [finalPrice, finalCustom, directToFilm];
  }

  const [finalPrice, finalCustom, directToFilm] = normalPrice();

  function creditCardPrice() {
    const fixedCreditCardPrice = Math.ceil(customPrice * 2) / 2;
    const totalPrice = fixedCreditCardPrice * receivedData.shirtQuantity;
    const fixedPrice = totalPrice * 100;
    const creditCardFinalPrice = Dinero({ amount: fixedPrice })
      .setLocale("pt-BR")
      .toFormat("0,0.00");
    console.log(fixedPrice, creditCardFinalPrice);
    let installmentPrice, numberOfInstallments;
    for (let i = 10; i > 0; i--) {
      numberOfInstallments = i;
      installmentPrice = totalPrice / numberOfInstallments;
      if (installmentPrice >= 100) {
        break;
      }
    }

    const installmentPriceFixed = installmentPrice * 100;
    const installmentValue = Dinero({ amount: installmentPriceFixed })
      .setLocale("pt-BR")
      .toFormat("0,0.00");
    return [numberOfInstallments, installmentValue, creditCardFinalPrice];
  }

  const [numberOfInstallments, installmentPrice, creditCardFinalPrice] =
    creditCardPrice();

  return [
    finalPrice,
    finalCustom,
    directToFilm,
    numberOfInstallments,
    installmentPrice,
    creditCardFinalPrice,
  ];
}

function calculateShirtPrice(receivedData) {
  return shirtAndCustom(receivedData);
}

module.exports = {
  calculateShirtPrice,
};
