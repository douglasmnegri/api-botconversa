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
  console.log(shirts);
  return shirts;
}

async function getSilkCosts() {
  try {
    let silkCosts = await dbConnection("silkScreenCosts")
      .orderBy("id", "desc")
      .first();
    console.log(silkCosts);
    return silkCosts;
  } catch (error) {
    console.error("Deu erro", error);
  }
}

async function customization(color) {
  let customCosts = await getSilkCosts();
  let print = parseFloat(customCosts.print);
  let screen = parseFloat(customCosts.screen); // Parse screen as a float
  console.log("Print Before: ", print);

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

  console.log("Print After: ", print);
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
    console.log("Print:", print);
    console.log("Screen:", screen);
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
    if (selectedShirt) {
      customPrice += parseFloat(selectedShirt.price);
    }

    let priceOverHundred = customPrice;
    if (receivedData.shirtQuantity >= 100) {
      if (receivedData.shirtID == 108) {
        priceOverHundred -= 4;
      } else {
        priceOverHundred -= 2;
      }
    }

    const roundedCustom = Math.ceil(priceOverHundred * 2) / 2;
    const fixedCustom = roundedCustom * receivedData.shirtQuantity * 100;

    const finalCustom = Dinero({ amount: fixedCustom })
      .setLocale("pt-BR")
      .toFormat("0,0.00");
    console.log("Fixed Custom", fixedCustom);
    const finalPrice = roundedCustom.toFixed(2).replace(/\./g, ",");

    function directToFilm(code) {
      let directToFilm = "";
      let priceOne = 0;
      let priceTwo = 0;

      switch (parseInt(code)) {
        case 108:
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

      if (colorFront != 0 && colorBack != 0 && roundedCustom > priceTwo) {
        directToFilm = priceTwo;
      } else if (
        ((colorFront != 0 && colorBack == 0) ||
          (colorFront == 0 && colorBack != 0)) &&
        roundedCustom > priceOne
      ) {
        directToFilm = priceOne;
      } else {
        directToFilm = null;
      }

      return directToFilm;
    }

    let DTF = directToFilm(receivedData.shirtID);
    if (DTF != null) {
      DTF = DTF.toFixed(2).replace(/\./g, ",");
    }

    return [finalPrice, finalCustom, DTF];
  }

  const [finalPrice, finalCustom, directToFilm] = normalPrice();

  function creditCardPrice() {
    const fixedCreditCardPrice = Math.ceil(customPrice * 2) / 2;
    const totalPrice = Math.round(
      fixedCreditCardPrice * receivedData.shirtQuantity
    ); // Ensure totalPrice is an integer
    const fixedPrice = Math.round(totalPrice * 100); // Ensure fixedPrice is an integer
    console.log("Fixed Price: ", fixedPrice, "Total Price: ", totalPrice);
    const creditCardFinalPrice = Dinero({ amount: fixedPrice })
      .setLocale("pt-BR")
      .toFormat("0,0.00");

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
