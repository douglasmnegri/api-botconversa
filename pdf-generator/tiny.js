const url = "https://api.tiny.com.br/api2/pedidos.pesquisa.php";
const token = "506af7e2a3c59e0b47fe67d9a425ab034beb843f";
const numero = 7631;
const formato = "JSON";
const data = new URLSearchParams({
  token: token,
  numero: numero,
  formato: formato,
});

async function getSystemQuote(url, data) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      body: data,
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`Problema com ${url}, ${response.statusText}`);
    }

    const responseData = await response.text();

    if (!responseData) {
      throw new Error(`Problema obtendo retorno de ${url}`);
    }

    return responseData;
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

async function printOrder(req, res) {
  try {
    const response = await getSystemQuote(url, data);
    console.log("Resposta:", response);
    res.json({
      message: "Pedido obtido com sucesso",
      data: JSON.parse(response),
    });
  } catch (error) {
    console.error("Erro ao obter pedido:", error);
    res.status(500).json({ error: "Erro ao obter pedido" });
  }
}

module.exports = {
  printOrder,
};
