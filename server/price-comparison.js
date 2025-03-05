function getPriceComparison(
  sPrice,
  sQuantity,
  cPrice,
  cFront,
  cBack,
  sheetCost
) {
  let priceOverHundred = cPrice + parseFloat(sPrice);

  console.log(cPrice, sQuantity);
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

  const DTF = directToFilm();
  const fixedPrice = Math.ceil(priceOverHundred * 2) / 2;

  return [fixedPrice, DTF];
}

module.exports = {
  getPriceComparison,
};
