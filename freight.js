async function calculateQuote(req, res) {
    try {
        const requestBody = req.body;
        const modifiedBodyContent = manageData(requestBody);
        const shippingPrice = await fetchPrice(modifiedBodyContent);
        res.send(generateString(shippingPrice));

    } catch (error) {
        console.error('Error in calculateQuote:', error);
        res.status(500).send('Internal Server Error');
    }
}

function manageData(requestBody) {
    let loadCapacity = Math.ceil(requestBody.Shirts / 250);
    let priceTag = requestBody.ShipmentInvoiceValue;
    let buyerAddress = requestBody.RecipientCEP;
    let shirtsWeight = requestBody.Shirts * 0.15;
    let shirtQuantity = requestBody.Shirts;


    const modifiedBodyContent = {
        "SellerCEP": "88310670",
        "RecipientCEP": requestBody.RecipientCEP,
        "ShipmentInvoiceValue": requestBody.ShipmentInvoiceValue,
        "ShippingServiceCode": null,
        "ShippingItemArray": [
          {
            "Height": 55,
            "Length": 40,
            "Quantity": loadCapacity,
            "Weight": shirtsWeight,
            "Width": 45,
            "Shirts": shirtQuantity
          }
        ],
        "RecipientCountry": "BR"
      }

      return modifiedBodyContent;
}

async function fetchPrice(modifiedBodyContent) {
    const url = 'https://api.frenet.com.br/shipping/quote';
    const headers = {
        accept: 'application/json',
        'content-type': 'application/json',
        token: process.env.FRENET_TOKEN
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(modifiedBodyContent)
        });

        const responseBody = await response.json();
        return responseBody;
    } catch (error) {
        console.error('Error in fetchPrice:', error);
        throw new Error('Failed to fetch price from Frenet API');
    }
}

function generateString(shippingPrice) {
    const mapBody = shippingPrice.ShippingSevicesArray.map((element) => {
        if(element.ShippingPrice !== undefined) {
        return `Transportadora: ${element.Carrier}
        Preço: R$ ${element.ShippingPrice}
        Tempo de Entrega: ${element.DeliveryTime} dias úteis`;
    }
    });
    return mapBody.join('\n\n');
}

module.exports = {
    calculateQuote
};
