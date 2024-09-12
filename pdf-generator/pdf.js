const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
const dotenv = require("dotenv");
const { uploadPDFToS3 } = require("../script");
const { v4: uuidv4 } = require("uuid");
const axios = require('axios');



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
      .replace(/{{itemQuantity}}/g, postData.shirtQuantity);

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

    return await sendWhatsAppMessage(
      `https://orcamento-click.s3.us-west-2.amazonaws.com/${pdfPath}`,
      "5548991710155"
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

async function sendWhatsAppMessage(pdfUrl, phoneNumber) {
  const token = process.env.WHATSAPP_TOKEN;

  const messageData = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "document",
    document: {
      link: pdfUrl,
      caption: "Here is your proposal!",
    },
  };

  try {
    const response = await axios.post(
      "https://graph.facebook.com/v20.0/361460917059712/messages",
      messageData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("WhatsApp message sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}


module.exports = { getProposal };
