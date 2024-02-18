const {calculateShirtPrice, sum} = require('./run-price');

test('calculate shirt price for cotton shirts', () => {
    expect(calculateShirtPrice({shirtID: 102, colorBack: 1, colorFront: 1, shirtQuantity: 300})).toStrictEqual(['15,00', '4500,00']);
  });

  