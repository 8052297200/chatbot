// Import required libraries
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize the Express app
const app = express();
app.use(bodyParser.json());

// Your verify token from .env file
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Webhook verification route
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check the mode and token sent
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge); // Respond with the challenge token
  } else {
    res.status(403).send('Forbidden');
  }
});

// Handle incoming messages
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Log the incoming webhook for debugging
  console.log('Incoming Webhook:', JSON.stringify(body, null, 2));

  // Respond to WhatsApp servers
  res.status(200).send('EVENT_RECEIVED');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
