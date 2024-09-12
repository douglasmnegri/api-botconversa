// Import required AWS SDK clients and commands for Node.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { readFileSync } = require("fs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadPDFToS3 = async (fileName, bytes) => {
  try {
    // Set the parameters
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: bytes, 
      ContentType: "application/pdf", 
    };

    // Upload the file
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);

    console.log(`File uploaded successfully: ${data.ETag}`);
  } catch (err) {
    console.error("Error uploading file:", err);
  }
};
  
module.exports = { uploadPDFToS3 };
