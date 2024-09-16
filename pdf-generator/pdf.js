const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
const dotenv = require("dotenv");
const { uploadPDFToS3 } = require("../script");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const knex = require("knex");
const config = require("../knexfile");
const env =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const dbConnection = knex(config[env]);

// Load the HTML template
async function getProposal(
  unitCostCash,
  finalCost,
  installmentNumber,
  installmentPrice,
  creditCardPrice,
  unitCostCard,
  postData
) {
  try {
    let template = fs.readFileSync(path.join(__dirname, "quote.html"), "utf8");
    async function getShirtName(id) {
      const shirts = await dbConnection("shirts").where("id", id).first();
      return shirts.name;
    }

    const shirtName = await getShirtName(postData.shirtID);

    // Replace placeholders with actual data
    template = template
      .replace(/{{unitCostCash}}/g, unitCostCash)
      .replace(/{{finalCost}}/g, finalCost)
      .replace(/{{installmentNumber}}/g, installmentNumber)
      .replace(/{{installmentPrice}}/g, installmentPrice)
      .replace(/{{creditCardPrice}}/g, creditCardPrice)
      .replace(/{{unitCostCard}}/g, unitCostCard)
      .replace(/{{colorFront}}/g, postData.colorFront)
      .replace(/{{colorBack}}/g, postData.colorBack)
      .replace(/{{itemQuantity}}/g, postData.shirtQuantity)
      .replace(/{{shirtName}}/g, shirtName);

    const browser = await puppeteer.launch({
      headless: true, // Change to true for headless mode
    });

    const page = await browser.newPage();

    // Log console messages from the page
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.setContent(template, { waitUntil: "networkidle2" });
    await page.addStyleTag({ path: path.join(__dirname, "pdf.css") });

    await page.emulateMediaType("print");

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    const b = Buffer.from(pdfBuffer);

    // Write the PDF buffer to a file
    const pdfPath = `proposta-${uuidv4()}.pdf`;
    await browser.close();

    await uploadPDFToS3(pdfPath, b);

    return `https://orcamento-click.s3.us-west-2.amazonaws.com/${pdfPath}`;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

module.exports = { getProposal };
