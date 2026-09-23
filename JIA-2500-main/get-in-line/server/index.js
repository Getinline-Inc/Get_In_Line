const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const axios = require('axios');

require('dotenv').config({ path: '../.env' });

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

const requiredTwilioEnv = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
];

const hasTwilioConfig = requiredTwilioEnv.every((key) => Boolean(process.env[key]));
const client = hasTwilioConfig
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

//Welcome Page for the Server
app.get('/', (req, res) => {
    res.send('Welcome to the Express Server')
})

async function sendTextMessage(recipient, textMessage) {
    if (!client) {
        const error = new Error('SMS service is not configured');
        error.statusCode = 503;
        throw error;
    }

    if (!recipient || !textMessage) {
        const error = new Error('recipient and textMessage are required');
        error.statusCode = 400;
        throw error;
    }

    return client.messages.create({
        body: textMessage,
        to: recipient,
        from: process.env.TWILIO_PHONE_NUMBER
    });
}

//Twilio
app.post('/send-text', async (req, res) => {
    try {
        const { recipient, textMessage } = req.body;
        const message = await sendTextMessage(recipient, textMessage);
        res.status(202).json({ status: 'queued', sid: message.sid });
    } catch (error) {
        console.error('SMS send failed', error.message);
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

// Backward-compatible route for older clients. Prefer POST /send-text.
app.get('/send-text', async (req, res) => {
    try {
        const { recipient, textmessage } = req.query;
        const message = await sendTextMessage(recipient, textmessage);
        res.status(202).json({ status: 'queued', sid: message.sid });
    } catch (error) {
        console.error('SMS send failed', error.message);
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

//Google Maps API
app.get('/calculate-distance', (req, res) => {
    const { origins, destinations } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return res.status(503).json({ error: 'Google Maps API key is not configured' });
    }

    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&units=imperial&key=${apiKey}`,
        headers: { }
    };

    axios(config)
    .then(function (response) {
        res.status(200).json(response.data);
    })
    .catch(function (error) {
        console.error('Distance calculation failed', error.message);
        res.status(500).json({ error: 'Distance calculation failed' });
    });
});

app.listen(process.env.PORT || 4000, () => console.log(`Running on Port ${process.env.PORT || 4000}`));
