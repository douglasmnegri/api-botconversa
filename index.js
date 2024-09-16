// index.js
require("dotenv").config();
console.log(process.env);
const express = require("express");
const app = express();
const port = 3001;
const { router } = require("./configs.js");

const { calculateShirtPrice } = require("./run-price.js");
const { calculateQuote } = require("./freight.js");
const { getCEP } = require("./check-cep.js");
const { getProposal } = require("./pdf-generator/pdf.js");

app.use(express.json());
app.use("/api/config", router);

app.post("/api/calculate", async (req, res) => {
  try {
    const postData = req.body;
    console.log(postData);
    const priceResult = await calculateShirtPrice(postData);

    // Send the processed data and price back in the response
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

app.post("/api/generate-pdf", async (req, res) => {
  try {
    const postData = req.body;
    const priceResult = await calculateShirtPrice(postData);

    const pdfBuffer = await getProposal(
      priceResult[0],
      priceResult[1],
      priceResult[2],
      priceResult[3],
      priceResult[4],
      priceResult[5],
      postData
    );

    // res.send(pdfBuffer);
    res.json({
      message: "BotConversa received this message successfully",
      processedData: pdfBuffer,
    });

    console.log(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
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
