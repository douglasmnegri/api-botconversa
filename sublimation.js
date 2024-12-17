const Dinero = require("dinero.js");
const knex = require("knex");
const config = require("./knexfile");

const env =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const dbConnection = knex(config[env]);

async function getPrice(id) {
  const shirts = await dbConnection("shirts").where("id", id).first();
  return shirts;
}

async function getPrintingPrice(id) {
  if (id) {
    const printingPrice = await dbConnection("custom_printing")
      .where("id", id)
      .first();
    return printingPrice.sublimation;
  } else {
    return 0;
  }
}

function creditCardPrice(sublimationPrice, shirtQuantity) {
  const totalPrice = sublimationPrice * shirtQuantity;

  const creditCardFinalPrice = Dinero({ amount: totalPrice * 100 })
    .setLocale("pt-BR")
    .toFormat("0,0.00");

  const creditCardUnitPrice = Dinero({ amount: sublimationPrice * 100 })
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

  const installmentPriceFixed = Math.round(installmentPrice * 100);
  const installmentValue = Dinero({ amount: installmentPriceFixed })
    .setLocale("pt-BR")
    .toFormat("0,0.00");
  return [
    numberOfInstallments,
    installmentValue,
    creditCardFinalPrice,
    creditCardUnitPrice,
  ];
}

function retailPrice(sublimationPrice, shirtQuantity) {
  if (shirtQuantity >= 100) {
    sublimationPrice -= 2;
  }
  const finalPrice = sublimationPrice * shirtQuantity;

  const finalPriceTotal = Dinero({ amount: finalPrice * 100 })
    .setLocale("pt-BR")
    .toFormat("0,0.00");

  const unitPrice = Dinero({ amount: sublimationPrice * 100 })
    .setLocale("pt-BR")
    .toFormat("0,0.00");

  return [unitPrice, finalPriceTotal];
}

async function calculatePolyesterPrice(receivedData) {
  const typeOfPrint = "Sublimação";
  const selectedShirt = await getPrice(receivedData.shirtID);
  const frontCustom = await getPrintingPrice(receivedData.customFront);
  const backCustom = await getPrintingPrice(receivedData.customBack);

  const shirtPrice = selectedShirt.price;
  const shirtQuantity = receivedData.shirtQuantity;

  const shirtSum = parseFloat(backCustom) + parseFloat(frontCustom);
  const initialPrice = shirtSum + parseFloat(shirtPrice);

  const [
    numberOfInstallments,
    installmentValue,
    creditCardFinalPrice,
    creditCardUnitPrice,
  ] = creditCardPrice(initialPrice, shirtQuantity);

  const [subPrice, finalPrice] = retailPrice(initialPrice, shirtQuantity);

  return [
    subPrice,
    finalPrice,
    numberOfInstallments,
    installmentValue,
    creditCardFinalPrice,
    creditCardUnitPrice,
    typeOfPrint,
  ];
}

module.exports = { calculatePolyesterPrice };
