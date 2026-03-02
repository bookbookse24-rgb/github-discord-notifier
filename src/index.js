require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { handleWebhook } = require('./webhook');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'github-discord-notifier' }));
app.post('/webhook', handleWebhook);

app.listen(PORT, '0.0.0.0', () => console.log(`🔔 GitHub Discord Notifier running on port ${PORT}`));
