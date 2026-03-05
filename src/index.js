require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { handleWebhook } = require('./webhook');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const SUBSCRIBERS_FILE = path.join(__dirname, '..', 'subscribers.json');

// Subscriber management
function loadSubscribers() {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveSubscriber(email, tier = 'free') {
  const subscribers = loadSubscribers();
  const existing = subscribers.find(s => s.email === email);
  if (existing) {
    existing.tier = tier;
    existing.updated = new Date().toISOString();
  } else {
    subscribers.push({
      email,
      tier,
      joined: new Date().toISOString()
    });
  }
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
  return !existing;
}

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

// Marketing landing page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>GitHub Discord Notifier - Real-time Alerts</title>
  <meta name="description" content="Send rich GitHub event notifications to your Discord server.">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
    h1 { color: #5865F2; }
    .price { font-size: 2em; color: #059669; font-weight: bold; }
    .features { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta { background: #5865F2; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 20px 0; }
    .cta:hover { background: #4752c4; }
    footer { margin-top: 40px; color: #6b7280; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>🔔 GitHub Discord Notifier</h1>
  <p>Get real-time GitHub event notifications in your Discord server.</p>
  
  <div class="price">Free: 100 notifications/month • Pro: $9/month (unlimited)</div>
  
  <div class="signup" style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #22c55e;">
    <h3>🚀 Get Early Access</h3>
    <form id="signup-form" style="display: flex; gap: 10px; flex-wrap: wrap;">
      <input type="email" id="email" placeholder="your@email.com" required style="flex: 1; min-width: 200px; padding: 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px;">
      <button type="submit" style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">Join Waitlist</button>
    </form>
    <p id="form-message" style="margin-top: 10px; font-weight: bold;"></p>
  </div>
  
  <script>
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const btn = e.target.querySelector('button');
      const msg = document.getElementById('form-message');
      btn.disabled = true;
      btn.textContent = 'Joining...';
      try {
        const res = await fetch('/subscribe', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, tier: 'free'})
        });
        const data = await res.json();
        msg.style.color = data.ok ? '#16a34a' : '#dc2626';
        msg.textContent = data.message;
        if (data.ok) e.target.reset();
      } catch (err) {
        msg.style.color = '#dc2626';
        msg.textContent = 'Error joining waitlist';
      }
      btn.disabled = false;
      btn.textContent = 'Join Waitlist';
    });
  </script>
  
  <div class="features">
    <h3>Events Supported:</h3>
    <ul>
      <li>✅ Pull Requests (opened, merged, closed)</li>
      <li>✅ Issues (opened, closed, comments)</li>
      <li>✅ Commits & Pushes</li>
      <li>✅ Branch created/deleted</li>
      <li>✅ Releases</li>
      <li>✅ Custom filters</li>
    </ul>
  </div>
  
  <a href="#" class="cta">Start Free →</a>
  
  <footer>
    <p>Questions? Contact: support@discordnotifier.dev</p>
    <p>© 2026 GitHub Discord Notifier</p>
  </footer>
</body>
</html>
  `);
});

// Subscribe endpoint
app.post('/subscribe', (req, res) => {
  const { email, tier } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  // Basic email validation
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  const isNew = saveSubscriber(email, tier || 'free');
  console.log(`📧 New subscription: ${email} (${isNew ? 'new' : 'updated'}) - ${tier || 'free'}`);
  res.json({ 
    ok: true, 
    message: isNew ? 'Successfully subscribed!' : 'Subscription updated!',
    subscribers: loadSubscribers().length
  });
});

// Subscriber count endpoint
app.get('/subscribers/count', (req, res) => {
  const subscribers = loadSubscribers();
  const counts = { free: 0, pro: 0 };
  subscribers.forEach(s => {
    counts[s.tier] = (counts[s.tier] || 0) + 1;
  });
  res.json({
    total: subscribers.length,
    byTier: counts
  });
});

// Purchase inquiry endpoint - logs interest for manual follow-up
const INQUIRIES_FILE = path.join(__dirname, '..', 'inquiries.json');

function loadInquiries() {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      return JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveInquiry(inquiry) {
  const inquiries = loadInquiries();
  inquiries.push({ ...inquiry, created: new Date().toISOString() });
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
  console.log(`💰 New inquiry: ${inquiry.type} - ${inquiry.email}`);
}

app.post('/inquire', (req, res) => {
  const { email, name, company, type, message } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  saveInquiry({ email, name, company, type, message });
  res.json({ ok: true, message: 'Thanks for your interest! We\'ll be in touch soon.' });
});

// Get inquiries (for admin)
app.get('/inquiries', (req, res) => {
  const inquiries = loadInquiries();
  res.json({ total: inquiries.length, inquiries });
});

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
