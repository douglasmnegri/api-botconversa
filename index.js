// index.js
require("dotenv").config();
console.log(process.env);
const express = require("express");
const app = express();
const port = 3001;
const { router } = require("./configs.js");

const { calculateShirtPrice } = require("./server/run-price.js");
const { calculateQuote } = require("./freight.js");
const { getCEP } = require("./check-cep.js");
const { getProposal } = require("./pdf-generator/pdf.js");
const { calculatePolyesterPrice } = require("./sublimation.js");
const { sendPDF } = require("./server/get-pdf-url.js");

app.use(express.json());
app.use("/api/config", router);

app.post("/api/sublimation", async (req, res) => {
  try {
    const postData = req.body;
    Number(postData.shirtQuantity) < 20
      ? (postData.shirtQuantity = 20)
      : postData.shirtQuantity;
    const priceResult = await calculatePolyesterPrice(postData);

    const pdfBuffer = await getProposal(
      priceResult[0],
      priceResult[1],
      priceResult[2],
      priceResult[3],
      priceResult[4],
      priceResult[5],
      priceResult[6],
      postData
    );

    res.json({
      message: "Sublimation Quote - Received",
      processedData: pdfBuffer,
      totalCost: priceResult[4],
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/generate-pdf", async (req, res) => {
  try {
    const postData = req.body;
    Number(postData.shirtQuantity) < 20
      ? (postData.shirtQuantity = 20)
      : postData.shirtQuantity;

    const priceResult = await calculateShirtPrice(postData);
    const pdfBuffer = await getProposal(
      priceResult[0],
      priceResult[1],
      priceResult[2],
      priceResult[3],
      priceResult[4],
      priceResult[5],
      priceResult[6],
      postData
    );

    res.json({
      message: "BotConversa received this message successfully",
      processedData: pdfBuffer,
      totalCost: priceResult[4],
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/calculate", async (req, res) => {
  try {
    const postData = req.body;
    const priceResult = await calculateShirtPrice(postData);

    res.json({
      message: "BotConversa received this message successfully",
      processedData: postData,
      price: priceResult,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/pdf-url", async (req, res) => {
  try {
    const postData = req.body;
    console.log(postData);
    const pdfData = await sendPDF(postData);

    res.json({
      message: "BotConversa received this message successfully",
      processedData: postData,
      data: pdfData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/quote", calculateQuote);

app.post("/api/getcep", getCEP);

app.post("/api/pdf");

app.get("/api/health", (req, res) => {
  console.log("Message Received (GET)");
  res.send("OK");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
