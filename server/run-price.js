const Dinero = require("dinero.js");

const { getPrice, getSilkCosts, getDTFCost } = require("./connect-db");
const { getPriceComparison } = require("./price-comparison");
const { creditCardPrice } = require("./credit-card");

async function calculateCustomization(data) {
  let silkScreenCosts;
  if (data.shirtQuantity < 100) {
    silkScreenCosts = await getSilkCosts(1);
  } else {
    silkScreenCosts = await getSilkCosts(2);
  }

  calculateCosts = async (color) => {
    let print = parseFloat(silkScreenCosts.print);
    let screen = parseFloat(silkScreenCosts.screen);
    let ink = parseFloat(silkScreenCosts.ink);

    for (let i = 0; i < color - 1; i++) {
      print += 45;
      screen += ink;
    }

    return { print, screen };
  };

  const customFront = async (colorFront) => {
    if (colorFront != 0) {
      const { print, screen } = await calculateCosts(colorFront);

      return roundAndProfit(print, screen, silkScreenCosts.profit);
    } else {
      return [0, 0];
    }
  };

  const customBack = async (colorBack) => {
    if (colorBack != 0) {
      const { print, screen } = await calculateCosts(colorBack);
      return roundAndProfit(print, screen, silkScreenCosts.profit);
    } else {
      return [0, 0];
    }
  };

  return [
    await customFront(data.colorFront),
    await customBack(data.colorBack),
    silkScreenCosts,
  ];
}

async function roundAndProfit(print, screen, profit) {
  try {
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

function arrayEquals(arr1, arr2) {
  return (
    Array.isArray(arr1) &&
    Array.isArray(arr2) &&
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}

async function calculateCustomPrice(receivedData) {
  const customCost = await calculateCustomization(receivedData);
  const frontCustomization = customCost[0];
  const backCustomization = customCost[1];
  let customPriceFront = 0;
  let customPriceBack = 0;

  const setup = customCost[2].setup;
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
  const sheetCost = await getDTFCost();

  function getFinalPrice() {
    const [fixedPrice, DTF] = getPriceComparison(
      selectedShirt.price,
      receivedData.shirtQuantity,
      customPrice,
      colorFront,
      colorBack,
      sheetCost
    );

    const checkForValue = fixedPrice > DTF ? DTF : fixedPrice;
    const typeOfPrint =
      fixedPrice < DTF ? "Serigrafia (máximo de 28x35cm) " : "DTF Tamanho A4";
    const fixedCustom = checkForValue * receivedData.shirtQuantity;

    const finalPriceTotal = Dinero({ amount: fixedCustom * 100 })
      .setLocale("pt-BR")
      .toFormat("0,0.00");
    const unitPrice = checkForValue.toFixed(2).replace(/\./g, ",");

    return [unitPrice, finalPriceTotal, checkForValue, typeOfPrint];
  }

  const [unitPrice, finalPriceTotal, checkForValue, typeOfPrint] =
    getFinalPrice();

  const [
    numberOfInstallments,
    installmentPrice,
    creditCardFinalPrice,
    creditCardUnitPrice,
  ] = creditCardPrice(
    receivedData.shirtQuantity,
    checkForValue,
    receivedData.shirtID
  );

  return [
    unitPrice,
    finalPriceTotal,
    numberOfInstallments,
    installmentPrice,
    creditCardFinalPrice,
    creditCardUnitPrice,
    typeOfPrint,
  ];
}

function calculateShirtPrice(receivedData) {
  return shirtAndCustom(receivedData);
}

module.exports = {
  calculateShirtPrice,
};
