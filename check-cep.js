async function getCEP(req, res) {
  try {
    const bodyRequest = req.body;
    const fixedCEP = fixCEP(bodyRequest);
    const responseFromViacep = await checkURL(fixedCEP);
    const clientData = generateString(responseFromViacep);
    res.json({
      address: clientData,
    });
  } catch (error) {
    console.error("Error in getCEP:", error);
    res.status(500).send("Internal Server Error");
  }
}

function fixCEP(bodyRequest) {
  let clientAddress = bodyRequest.RecipientCEP;
  if (clientAddress.length === 7) {
    clientAddress = "0" + clientAddress;
  }
  let correctUrl = `https://viacep.com.br/ws/${clientAddress}/json/`;
  return correctUrl;
}

async function checkURL(fixedCEP) {
  const url = fixedCEP;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from Viacep API. Status: ${response.status}`
      );
    }

    const responseBody = await response.json();
    return responseBody;
  } catch (error) {
    throw new Error("Failed to fetch data from Viacep API");
  }
}

function generateString(data) {
    if (data.bairro === "" || data.logradouro === "") {
      return `
                  Cidade: ${data.localidade}
                  Estado: ${data.estado}`;
    } else {
      return `
                  Logradouro: ${data.logradouro}
                  Bairro: ${data.bairro}
                  Cidade: ${data.localidade}
                  Estado: ${data.estado}`;
    }
}

module.exports = {
  getCEP,
};
