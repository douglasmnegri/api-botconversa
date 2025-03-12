const Dinero = require("dinero.js");
function getPriceComparison(
  sPrice,
  sQuantity,
  cPrice,
  cFront,
  cBack,
  sheetCost,
  sID,
  press
) {
  let priceOverHundred = cPrice + parseFloat(sPrice);

  if (sQuantity >= 100) {
    priceOverHundred -= 2;
  }

  function directToFilm() {
    let customDTFPrice = parseFloat(sPrice);

    if (cFront > 0) {
      customDTFPrice =
        customDTFPrice +
        parseFloat(sheetCost.DTF) +
        parseFloat(sheetCost.press);
    }
    if (cBack > 0) {
      customDTFPrice =
        customDTFPrice +
        parseFloat(sheetCost.DTF) +
        parseFloat(sheetCost.press);
    }

    return customDTFPrice;
  }
  const DTFPrice = directToFilm();
  const silkPrice = Math.ceil(priceOverHundred * 2) / 2;
  let priceComparison;
  let typeOfPrint;
  if (DTFPrice < silkPrice) {
    typeOfPrint = "DTF Tamanho A4";
    priceComparison = DTFPrice;
  } else {
    typeOfPrint = "Serigrafia (máximo de 28x35cm)";
    priceComparison = silkPrice;
    if (sID == 106) {
      console.log(cBack, cFront);
      cBack > 0 && cFront > 0
        ? (priceComparison += parseFloat(press.press) * 2)
        : (priceComparison += parseFloat(press.press));
    }
  }

  console.log("TESTEEEEEE", priceComparison, silkPrice)

  const finalPriceTotal = Dinero({ amount: priceComparison * sQuantity * 100 })
    .setLocale("pt-BR")
    .toFormat("0,0.00");
  const unitPrice = priceComparison.toFixed(2).replace(/\./g, ",");

  return [unitPrice, finalPriceTotal, priceComparison, typeOfPrint];
}

module.exports = {
  getPriceComparison,
};
