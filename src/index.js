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

const NOTIFICATION_LIMIT_FREE = 100;
const PRO_TIERS = ['pro', 'business', 'enterprise'];

function isProTier(tier) {
  return PRO_TIERS.includes(tier);
}

function checkNotificationLimit(email, tier) {
  if (isProTier(tier)) return { allowed: true, remaining: 'unlimited' };
  
  const stats = getUserNotificationStats(email);
  const today = new Date().toISOString().split('T')[0];
  const todayCount = stats.daily || 0;
  
  if (todayCount >= NOTIFICATION_LIMIT_FREE) {
    return { allowed: false, remaining: 0, upgrade: true };
  }
  return { allowed: true, remaining: NOTIFICATION_LIMIT_FREE - todayCount };
}

function getUserNotificationStats(email) {
  const subscribers = loadSubscribers();
  const sub = subscribers.find(s => s.email === email);
  if (!sub) return { daily: 0, total: 0 };
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const monthlyCount = sub.notifications?.monthly || [];
  
  const daily = monthlyCount.filter(d => d.date === today).reduce((sum, d) => sum + d.count, 0);
  const total = monthlyCount.reduce((sum, d) => sum + d.count, 0);
  
  return { daily, total };
}

function incrementNotificationCount(email) {
  const subscribers = loadSubscribers();
  const sub = subscribers.find(s => s.email === email);
  if (!sub) return;
  
  const today = new Date().toISOString().split('T')[0];
  if (!sub.notifications) sub.notifications = { monthly: [] };
  
  const todayEntry = sub.notifications.monthly.find(d => d.date === today);
  if (todayEntry) {
    todayEntry.count++;
  } else {
    sub.notifications.monthly.push({ date: today, count: 1 });
  }
  
  // Keep only last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  sub.notifications.monthly = sub.notifications.monthly.filter(d => new Date(d.date) >= thirtyDaysAgo);
  
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
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

// Per-repo configuration (Pro feature)
const REPO_CONFIG_FILE = path.join(__dirname, '..', 'repo-config.json');

function loadRepoConfigs() {
  try {
    if (fs.existsSync(REPO_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(REPO_CONFIG_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveRepoConfig(repoFullName, config) {
  const configs = loadRepoConfigs();
  configs[repoFullName] = { ...configs[repoFullName], ...config, updated: new Date().toISOString() };
  fs.writeFileSync(REPO_CONFIG_FILE, JSON.stringify(configs, null, 2));
}

function getRepoConfig(repoFullName) {
  const configs = loadRepoConfigs();
  return configs[repoFullName] || null;
}

// Check if notification should be sent based on filter rules
function shouldNotify(config, event, payload) {
  if (!config) return { allow: true };
  
  // Branch filter
  if (config.branches && config.branches.length > 0) {
    const branch = payload.ref?.replace('refs/heads/', '') || '';
    if (!config.branches.includes(branch)) {
      return { allow: false, reason: 'branch filter' };
    }
  }
  
  // Label filter (for issues/PRs)
  if (config.labels && config.labels.length > 0) {
    const labels = payload.pull_request?.labels || payload.issue?.labels || [];
    const hasLabel = labels.some(l => config.labels.includes(l.name || l));
    if (!hasLabel) {
      return { allow: false, reason: 'label filter' };
    }
  }
  
  // Author filter
  if (config.excludeAuthors && config.excludeAuthors.length > 0) {
    const author = payload.sender?.login || payload.pull_request?.user?.login || '';
    if (config.excludeAuthors.includes(author)) {
      return { allow: false, reason: 'author filter' };
    }
  }
  
  // Event type filter
  if (config.events && config.events.length > 0) {
    if (!config.events.includes(event)) {
      return { allow: false, reason: 'event filter' };
    }
  }
  
  return { allow: true };
}

// API endpoints for repo configuration (Pro feature)
app.post('/api/repos/:owner/:repo/config', (req, res) => {
  const { owner, repo } = req.params;
  const { webhookUrl, branches, labels, excludeAuthors, events, email } = req.body;
  
  // Check tier
  if (email) {
    const subscribers = loadSubscribers();
    const sub = subscribers.find(s => s.email === email);
    if (!sub || !isProTier(sub.tier)) {
      return res.status(403).json({ error: 'Pro tier required for per-repo config' });
    }
  }
  
  const repoFullName = `${owner}/${repo}`;
  saveRepoConfig(repoFullName, { webhookUrl, branches, labels, excludeAuthors, events });
  
  res.json({ ok: true, message: `Configuration saved for ${repoFullName}` });
});

app.get('/api/repos/:owner/:repo/config', (req, res) => {
  const { owner, repo } = req.params;
  const repoFullName = `${owner}/${repo}`;
  const config = getRepoConfig(repoFullName);
  
  if (!config) {
    return res.json({ configured: false });
  }
  
  // Don't expose webhook URL
  const safeConfig = { ...config };
  delete safeConfig.webhookUrl;
  res.json({ configured: true, ...safeConfig });
});

// Stats endpoint
app.get('/stats/:owner/:repo', (req, res) => {
  const { owner, repo } = req.params;
  res.json({
    repo: `${owner}/${repo}`,
    events: getNotificationStats(`${owner}/${repo}`)
  });
});

// User dashboard endpoint
app.get('/api/dashboard', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  const subscribers = loadSubscribers();
  const sub = subscribers.find(s => s.email === email);
  if (!sub) {
    return res.status(404).json({ error: 'Subscriber not found' });
  }
  
  const stats = getUserNotificationStats(email);
  const configs = loadRepoConfigs();
  const repoCount = Object.keys(configs).length;
  
  res.json({
    email: sub.email,
    tier: sub.tier,
    joined: sub.joined,
    notifications: stats,
    repoConfigs: repoCount,
    isPro: isProTier(sub.tier)
  });
});

// Stripe checkout endpoint (optional - only works if STRIPE_SECRET_KEY is set)
let stripe = null;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (e) {
  console.log('⚠️ Stripe not configured - checkout disabled');
}

app.post('/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  
  const { email, tier, priceId } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId || process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
      customer_email: email,
      metadata: { email, tier: tier || 'pro' }
    });
    
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Health check endpoint for Render/Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.2.0'
  });
});

// Metrics endpoint for monitoring
app.get('/metrics', (req, res) => {
  const subscribers = loadSubscribers();
  const proCount = subscribers.filter(s => isProTier(s.tier)).length;
  
  res.json({
    totalNotifications: totalNotifications,
    freeUsers: subscribers.length - proCount,
    proUsers: proCount,
    uptime: process.uptime()
  });
});

app.post('/webhook', handleWebhook);

app.listen(PORT, '0.0.0.0', () => console.log(`🔔 GitHub Discord Notifier v1.2.0 running on port ${PORT}`));
