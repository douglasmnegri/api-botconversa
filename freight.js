require('dotenv').config();

async function calculateQuote(req, res) {
  try {
    const requestBody = req.body;
    console.log("REQUEST BODY:", requestBody)
    const modifiedBodyContent = manageData(requestBody)[0];
    const totalExpressBodyContent = manageData(requestBody)[1];


    console.log("MODIFIED BODY CONTENT: ", modifiedBodyContent)
    const shippingPrice = await fetchPrice(modifiedBodyContent);
    const totalExpressPrice = await fetchPrice(totalExpressBodyContent);

    const freightData = generateString(shippingPrice, requestBody);
    const freightFilter = freightData.filter(
      (entry) => entry && !entry.includes("Total Express")
    );

    const totalExpressResult = generateString(totalExpressPrice, requestBody);
    const freightResult = freightFilter.concat(totalExpressResult).join("\n\n");

    // res.send(freightResult) so it's possible to read from BotConversa endpoint;
    res.json({
      freight: freightResult,
    });
  } catch (error) {
    console.error("Error in calculateQuote:", error);
    res.status(500).send("Internal Server Error");
  }
}

function manageData(requestBody) {
  let loadCapacity = Math.ceil(requestBody.Shirts / 500);
  let priceTag = requestBody.ShipmentInvoiceValue.replace(/,.*/, "");
  let buyerAddress = requestBody.RecipientCEP;
  let shirtsWeight = requestBody.Shirts * 0.1;
  let totalExpressWeight = requestBody.Shirts * 0.162;
  let shirtQuantity = requestBody.Shirts;


  console.log("PRICE TAG?", priceTag);
  const totalExpressBodyContent = {
    SellerCEP: "88310670",
    RecipientCEP: buyerAddress,
    ShipmentInvoiceValue: priceTag,
    ShippingServiceCode: "EXP",
    ShippingItemArray: [
      {
        Height: 30,
        Length: 30,
        Quantity: loadCapacity,
        Weight: totalExpressWeight,
        Width: 30,
        Shirts: shirtQuantity,
      },
    ],
    RecipientCountry: "BR",
  };
  const modifiedBodyContent = {
    SellerCEP: "88310670",
    RecipientCEP: buyerAddress,
    ShipmentInvoiceValue: priceTag,
    ShippingServiceCode: null,
    ShippingItemArray: [
      {
        Height: 30,
        Length: 30,
        Quantity: loadCapacity,
        Weight: shirtsWeight,
        Width: 30,
        Shirts: shirtQuantity,
      },
    ],
    RecipientCountry: "BR",
  };

  return [modifiedBodyContent, totalExpressBodyContent];
}

async function fetchPrice(modifiedBodyContent) {
  const url = "https://api.frenet.com.br/shipping/quote";
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    token: process.env.FRENET_TOKEN,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(modifiedBodyContent),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch price from Frenet API. Status: ${response.status}`
      );
    }

    const responseBody = await response.json();

    return responseBody;
  } catch (error) {
    throw new Error("Failed to fetch price from Frenet API");
  }
}

function generateString(shippingPrice, requestBody) {

  console.log("SHIPPING PRICE: ", shippingPrice);
  console.log("REQUESG BODY: ", requestBody);
  try {
    if (
      !shippingPrice ||
      !shippingPrice.ShippingSevicesArray ||
      !Array.isArray(shippingPrice.ShippingSevicesArray)
    ) {
      throw new Error("Invalid or missing shippingPrice structure");
    }

    const mapBody = shippingPrice.ShippingSevicesArray.map((element) => {
      if (element.ShippingPrice !== undefined) {
        switch (element.ServiceDescription) {
          case "Jadlog":
          case "Bauer Express":
            element.ShippingPrice = parseFloat(element.ShippingPrice) + 10;
            element.ShippingPrice = element.ShippingPrice.toFixed(2);
            break;

          case "JKM Logística":
            element.ShippingPrice = parseFloat(element.ShippingPrice) + 10;
            element.ShippingPrice = element.ShippingPrice.toFixed(2);
            break;

          case "Total Express":
            element.ShippingPrice = parseFloat(element.ShippingPrice) + 20;
            element.ShippingPrice = element.ShippingPrice.toFixed(2);
            break;

          case "KR Logística":
            element.ShippingPrice = parseFloat(element.ShippingPrice) + 15;
            element.ShippingPrice = element.ShippingPrice.toFixed(2);
            break;
        }

        if (requestBody.Shirts > 300 && requestBody.Shirts < 501) {
          switch (element.ServiceDescription) {
            case "Bauer Express":
              element.ShippingPrice = parseFloat(element.ShippingPrice) + 35;
              element.ShippingPrice = element.ShippingPrice.toFixed(2);
              break;
          }
        }

        return `Transportadora: ${element.Carrier}
            Preço: R$ ${element.ShippingPrice}
            Tempo de Transporte: ${element.DeliveryTime} dias úteis`;
      }
    });

    return mapBody;
    // return mapBody.join('\n\n');
  } catch (error) {
    throw error;
  }
}

module.exports = {
  calculateQuote,
};
