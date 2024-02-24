// index.js
require('dotenv').config()
console.log(process.env)
const express = require('express');
const app = express();
const port = 3001;

const {calculateShirtPrice} = require('./run-price');
const {calculateQuote} = require('./freight.js');
const {getCEP} = require('./check-cep.js');

app.use(express.json());

// Route handler for POST requests at /api/calculate
app.post('/api/calculate', async (req, res) => {
  try {
    const postData = req.body;
    // Pass the postData to the runPrice module
    const priceResult = await calculateShirtPrice(postData);
    console.log(priceResult);

    // Send the processed data and price back in the response
    res.json({
      message: 'BotConversa received this message successfully',
      processedData: postData,
      price: priceResult,
    });

    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error'});
  }
});

app.post('/api/quote', calculateQuote)

app.post('/api/getcep', getCEP)

app.get('/api/health', (req, res) => {
  // Handle the POST request
  console.log('Message Received (GET)');
  res.send('OK');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${port}`);
});
