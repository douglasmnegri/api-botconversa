const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
const { uploadPDFToS3 } = require("../script");
const { v4: uuidv4 } = require("uuid");
const knex = require("knex");
const config = require("../knexfile");
const env =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const dbConnection = knex(config[env]);

// Function to generate and upload the PDF
async function createAndUploadPDF(template, pdfPath) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

    await browser.close();

    // Upload PDF to S3
    await uploadPDFToS3(pdfPath, b);
    console.log("PDF File uploaded successfully");
  } catch (error) {
    console.error("Error generating or uploading PDF:", error);
  }
}

// Function to generate the proposal and immediately return the S3 address
async function getProposal(
  unitCostCash,
  finalCost,
  installmentNumber,
  installmentPrice,
  creditCardPrice,
  unitCostCard,
  printType,
  postData
) {
  try {
    let template = fs.readFileSync(path.join(__dirname, "quote.html"), "utf8");

    // Function to get shirt name and proposal ID from database
    async function getShirtName(id) {
      const shirts = await dbConnection("shirts").where("id", id).first();
      return shirts.name;
    }

    async function getProposalID(userNumber) {
      try {
        const proposal = await dbConnection("proposal_id")
          .insert({ phone: userNumber })
          .returning("id");

        const proposalID = proposal[0];
        return proposalID.id;
      } catch (error) {
        console.error("Erro: ", error);
      }
    }

    const proposalID = await getProposalID(postData.phone);
    const shirtName = await getShirtName(postData.shirtID);

    // Replace placeholders with actual data
    template = template
      .replace(/{{unitCostCash}}/g, unitCostCash)
      .replace(/{{finalCost}}/g, finalCost)
      .replace(/{{installmentNumber}}/g, installmentNumber)
      .replace(/{{installmentPrice}}/g, installmentPrice)
      .replace(/{{creditCardPrice}}/g, creditCardPrice)
      .replace(/{{unitCostCard}}/g, unitCostCard)
      .replace(/{{shirtName}}/g, shirtName)
      .replace(/{{proposal}}/g, proposalID)
      .replace(/{{printType}}/g, printType)
      .replace(/{{itemQuantity}}/g, postData.shirtQuantity);

    if (printType == "Sublimação") {
      template = template
        .replace(
          /{{colorFront}}/g,
          postData.customFront
            ? `Frente Tamanho ${postData.customFront == "1" ? "A4" : "A3"}`
            : ""
        )
        .replace(
          /{{colorBack}}/g,
          postData.customBack
            ? `+ Costas Tamanho ${postData.customBack == "1" ? "A4" : "A3"}`
            : ""
        );
    } else {
      template = template
        .replace(
          /{{colorFront}}/g,
          postData.colorFront ? `Frente em ${postData.colorFront} Cores + ` : ""
        )
        .replace(
          /{{colorBack}}/g,
          postData.colorBack ? `Costas em ${postData.colorBack} Cores` : ""
        );
    }

    // Generate a unique PDF filename and return the URL immediately
    const pdfPath = `proposta-${uuidv4()}.pdf`;
    const s3Url = `https://orcamento-click.s3.us-west-2.amazonaws.com/${pdfPath}`;

    // Offload the PDF creation and upload to a separate function
    createAndUploadPDF(template, pdfPath);

    // Immediately return the S3 URL
    return s3Url;
  } catch (error) {
    console.error("Error generating proposal:", error);
    throw error;
  }
}

module.exports = { getProposal };
