require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { handleWebhook } = require('./webhook');

const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory notification tracking
const notifStore = new Map();

function trackNotification(repoFullName, eventType) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${repoFullName}:${eventType}:${today}`;
  notifStore.set(key, (notifStore.get(key) || 0) + 1);
}

function getNotificationStats(repoFullName) {
  const store = global.notifStore || notifStore;
  const today = new Date().toISOString().split('T')[0];
  const stats = {};
  
  for (const [key, count] of store.entries()) {
    if (key.startsWith(repoFullName)) {
      const [, eventType, date] = key.split(':');
      if (!stats[eventType]) stats[eventType] = { today: 0, total: 0 };
      stats[eventType].total += count;
      if (date === today) stats[eventType].today += count;
    }
  }
  return stats;
}

app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'github-discord-notifier' }));

// Stats endpoint
app.get('/stats/:owner/:repo', (req, res) => {
  const { owner, repo } = req.params;
  res.json({
    repo: `${owner}/${repo}`,
    events: getNotificationStats(`${owner}/${repo}`)
  });
});

app.post('/webhook', handleWebhook);

app.listen(PORT, '0.0.0.0', () => console.log(`🔔 GitHub Discord Notifier running on port ${PORT}`));
