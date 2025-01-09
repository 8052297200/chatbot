const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const WHATSAPP_API_URL = `https://graph.facebook.com/v16.0/${process.env.PHONE_NUMBER_ID}/messages`;

// Webhook Verification
app.get("/webhook", (req, res) => {
  const verifyToken = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle Incoming Messages
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object) {
    const messages = body.entry[0].changes[0].value.messages;
    if (messages && messages[0]) {
      const message = messages[0];
      const phoneNumber = message.from;
      const text = message.text.body.toLowerCase();

      if (text === "hello") {
        sendCitySelection(phoneNumber);
      } else if (text === "basti") {
        sendDoctorList(phoneNumber);
      } else if (text === "dr. sharma") {
        sendDoctorDetails(phoneNumber);
      } else {
        sendReply(phoneNumber, "Sorry, I didn't understand. Please try again.");
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Functions to Send Messages
function sendCitySelection(phoneNumber) {
  const data = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: "Please select your city:",
      },
      action: {
        buttons: [
          { type: "reply", reply: { id: "city_basti", title: "Basti" } },
          { type: "reply", reply: { id: "city_lucknow", title: "Lucknow" } },
        ],
      },
    },
  };
  sendRequest(data);
}

function sendDoctorList(phoneNumber) {
  const data = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Available Doctors" },
      body: { text: "Select a doctor from the list below:" },
      footer: { text: "Click on a doctor to view details." },
      action: {
        button: "Doctors",
        sections: [
          {
            title: "Doctors in Basti",
            rows: [
              { id: "doctor_sharma", title: "Dr. Sharma", description: "Cardiologist" },
              { id: "doctor_gupta", title: "Dr. Gupta", description: "Dentist" },
            ],
          },
        ],
      },
    },
  };
  sendRequest(data);
}

function sendDoctorDetails(phoneNumber) {
  const data = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "image",
    image: {
      link: "https://example.com/doctor-image.jpg",
      caption: "Dr. Sharma\nSpecialist: Cardiologist\nAvailable: 10 AM - 4 PM\nFees: ₹500",
    },
  };
  sendRequest(data);
}

function sendReply(phoneNumber, text) {
  const data = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "text",
    text: { body: text },
  };
  sendRequest(data);
}

function sendRequest(data) {
  fetch(WHATSAPP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((json) => console.log("Message sent:", json))
    .catch((error) => console.error("Error sending message:", error));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
