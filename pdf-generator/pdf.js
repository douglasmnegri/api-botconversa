const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");


// Load the HTML template
async function getProposal(
  unitCostCash,
  finalCost,
  installmentNumber,
  installmentPrice,
  creditCardPrice,
  unitCostCard
) {
  try {
    let template = fs.readFileSync(path.join(__dirname, "quote.html"), "utf8");
    const serverUrl = "http://127.0.0.1:8080";
    const logoPath = `${serverUrl}/logo-click.svg`;
    const symbolPath = `${serverUrl}/symbol-click.svg`;

    // Replace placeholders with actual data
    template = template
      .replace("{{unitCostCash}}", unitCostCash)
      .replace("{{finalCost}}", finalCost)
      .replace("{{installmentNumber}}", installmentNumber)
      .replace("{{installmentPrice}}", installmentPrice)
      .replace("{{creditCardPrice}}", creditCardPrice)
      .replace("{{unitCostCard}}", unitCostCard)
      .replace("{{logoClick}}", logoPath)
      .replace("{{symbolClick}}", symbolPath);

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    // Log console messages from the page
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.setContent(template, { waitUntil: "networkidle2" });
    await page.addStyleTag({ path: path.join(__dirname, "pdf.css") });

    await page.emulateMediaType("print");


    const pdfBuffer = await page.pdf({
      path: "proposal-click.pdf",
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

module.exports = { getProposal };
