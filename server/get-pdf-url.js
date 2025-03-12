const { getURL } = require("./connect-db");

async function sendPDF(pdf_id) {
  pdf_id = parseInt(pdf_id.data);
  try {
    const pdf = await getURL(pdf_id);

    if (!pdf) {
      return "Não foi possível encontrar a proposta comercial";
    }

    const newDate = new Date(pdf[0].createdAt).toLocaleDateString("pt-BR");
    const url = pdf[0].pdf_url;
    return [newDate, url];
  } catch (error) {
    console.error("Error: ", error);
    return "Não foi possível encontrar a proposta comercial";
  }
}

module.exports = {
  sendPDF,
};
