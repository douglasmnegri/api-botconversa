async function getCEP(req, res) {
    try {
        const bodyRequest = req.body;
        const fixedCEP = fixCEP(bodyRequest);
        const responseFromPostmon = await checkURL(fixedCEP);
        const clientData = generateString(responseFromPostmon);  
        res.json({
            address:clientData
        });

    } catch (error) {
        console.error('Error in getCEP:', error);
        res.status(500).send('Internal Server Error');
    }
}

function fixCEP(bodyRequest) {
    const url = "https://api.postmon.com.br/v1/cep/";
    let clientAddress = bodyRequest.RecipientCEP;
    if(clientAddress.length === 7) {
        clientAddress = "0" + clientAddress;
    }
    let correctUrl = url + clientAddress;
    return correctUrl;
}

async function checkURL(fixedCEP) {
    const url = fixedCEP;

    try {
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data from Postmon API. Status: ${response.status}`);
        }

        const responseBody = await response.json();
        return responseBody;

    } catch (error) {
        throw new Error('Failed to fetch data from Postmon API');
    }
}

function generateString(data) {
    
    if (data.bairro === "" || data.logradouro === "") {
        return `
                Cidade: ${data.cidade}
                Estado: ${data.estado_info.nome}`;
    } else {
        return `
                Logradouro: ${data.logradouro}
                Bairro: ${data.bairro}
                Cidade: ${data.cidade}
                Estado: ${data.estado_info.nome}`;
    }

}


module.exports = {
    getCEP
};
