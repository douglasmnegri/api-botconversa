const Dinero = require("dinero.js");

function creditCardPrice(checkForValue, sQuantity, sID) {
  let fixedCreditCardPrice = checkForValue;
  if (sQuantity >= 100) {
    if (sID == 108) {
      fixedCreditCardPrice += 4;
    } else {
      fixedCreditCardPrice += 2;
    }
  }

  const totalPrice = fixedCreditCardPrice * sQuantity;

  const creditCardFinalPrice = Dinero({ amount: totalPrice * 100 })
    .setLocale("pt-BR")
    .toFormat("0,0.00");

  const creditCardUnitPrice = Dinero({ amount: fixedCreditCardPrice * 100 })
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

module.exports = {
  creditCardPrice,
};
