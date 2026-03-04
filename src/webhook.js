const crypto = require('crypto');
const { sendEmbed } = require('./discord');
const prFormatter = require('./formatters/pullRequest');
const pushFormatter = require('./formatters/push');
const issuesFormatter = require('./formatters/issues');
const releaseFormatter = require('./formatters/release');
const starFormatter = require('./formatters/star');
const reviewFormatter = require('./formatters/review');
const issueCommentFormatter = require('./formatters/issueComment');
const workflowRunFormatter = require('./formatters/workflowRun');
const deploymentFormatter = require('./formatters/deployment');
const checkRunFormatter = require('./formatters/checkRun');

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig || !process.env.GITHUB_WEBHOOK_SECRET) return true; // skip if no secret set
  const digest = 'sha256=' + crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}

const webhookFor = (event) => process.env[`DISCORD_WEBHOOK_${event.toUpperCase()}_URL`] || process.env.DISCORD_WEBHOOK_URL;

async function handleWebhook(req, res) {
  if (!verifySignature(req)) return res.status(401).json({ error: 'Invalid signature' });

  const event = req.headers['x-github-event'];
  const payload = req.body;
  res.json({ ok: true });

  try {
    let embed = null;

    if (event === 'pull_request' && ['opened','closed','review_requested'].includes(payload.action)) {
      embed = prFormatter.format(payload);
    } else if (event === 'push' && !payload.ref.includes('tags')) {
      embed = pushFormatter.format(payload);
    } else if (event === 'issues' && ['opened','closed','assigned'].includes(payload.action)) {
      embed = issuesFormatter.format(payload);
    } else if (event === 'release' && payload.action === 'published') {
      embed = releaseFormatter.format(payload);
    } else if (event === 'star' && payload.action === 'created') {
      embed = starFormatter.format(payload);
    } else if (event === 'pull_request_review' && ['submitted'].includes(payload.action)) {
      embed = reviewFormatter.format(payload);
    } else if (event === 'issue_comment' && ['created', 'edited'].includes(payload.action)) {
      embed = issueCommentFormatter.format(payload);
    } else if (event === 'workflow_run' && ['completed', 'in_progress', 'queued', 'requested'].includes(payload.action)) {
      embed = workflowRunFormatter.format(payload);
    } else if (event === 'deployment' && ['created'].includes(payload.action)) {
      embed = deploymentFormatter.format(payload);
    } else if (event === 'deployment_status' && ['success', 'failure', 'pending', 'error'].includes(payload.deployment_status.state)) {
      embed = deploymentFormatter.format(payload);
    } else if (event === 'check_run' && ['completed', 'in_progress', 'queued', 'requested', 'created'].includes(payload.action)) {
      embed = checkRunFormatter.format(payload);
    }

    if (embed) {
      await sendEmbed(webhookFor(event), embed);
      // Track notification (inline to avoid circular deps)
      const repoFullName = payload.repository?.full_name || 'unknown';
      const today = new Date().toISOString().split('T')[0];
      const key = `${repoFullName}:${event}:${today}`;
      if (!global.notifStore) global.notifStore = new Map();
      global.notifStore.set(key, (global.notifStore.get(key) || 0) + 1);
      console.log(`✅ Sent ${event} embed to Discord`);
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
}

module.exports = { handleWebhook };
