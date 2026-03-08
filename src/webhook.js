const crypto = require('crypto');
const { sendEmbed } = require('./discord');
const fs = require('fs');
const path = require('path');
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
const securityAdvisoryFormatter = require('./formatters/securityAdvisory');
const discussionFormatter = require('./formatters/discussion');
const forkFormatter = require('./formatters/fork');
const branchFormatter = require('./formatters/branch');
const repositoryFormatter = require('./formatters/repository');

const REPO_CONFIG_FILE = path.join(__dirname, '..', 'repo-config.json');

function loadRepoConfigs() {
  try {
    if (fs.existsSync(REPO_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(REPO_CONFIG_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
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
    const branch = payload.ref?.replace('refs/heads/', '') || 
                  payload.pull_request?.head?.ref || 
                  payload.repository?.default_branch || '';
    if (!config.branches.includes(branch)) {
      return { allow: false, reason: 'branch filter' };
    }
  }
  
  // Label filter (for issues/PRs)
  if (config.labels && config.labels.length > 0) {
    const labels = payload.pull_request?.labels || payload.issue?.labels || [];
    const hasLabel = labels.some(l => config.labels.includes(l.name || l));
    if (!hasLabel && labels.length > 0) {
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

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  // If GITHUB_WEBHOOK_SECRET is set, signature is required
  if (process.env.GITHUB_WEBHOOK_SECRET) {
    if (!sig) return false;
    const digest = 'sha256=' + crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
  }
  // No secret set - allow but warn (legacy mode)
  console.warn('⚠️ GITHUB_WEBHOOK_SECRET not set - webhook authentication disabled');
  return true;
}

const webhookFor = (event, repoConfig) => {
  // Use per-repo webhook URL if configured (Pro feature)
  if (repoConfig?.webhookUrl) {
    return repoConfig.webhookUrl;
  }
  return process.env[`DISCORD_WEBHOOK_${event.toUpperCase()}_URL`] || process.env.DISCORD_WEBHOOK_URL;
};

const threadFor = (event, repoConfig) => {
  // Use per-repo thread ID if configured (Pro feature)
  if (repoConfig?.threadId) {
    return repoConfig.threadId;
  }
  return null;
};

async function handleWebhook(req, res) {
  if (!verifySignature(req)) return res.status(401).json({ error: 'Invalid signature' });

  const event = req.headers['x-github-event'];
  const payload = req.body;
  res.json({ ok: true });

  // Get repo config for per-repo settings
  const repoFullName = payload.repository?.full_name || 
                       payload.repository?.owner?.login + '/' + payload.repository?.name ||
                       '';
  const repoConfig = getRepoConfig(repoFullName);

  // Check filter rules
  const filterResult = shouldNotify(repoConfig, event, payload);
  if (!filterResult.allow) {
    console.log(`⏭️ Skipped ${event} for ${repoFullName}: ${filterResult.reason}`);
    return;
  }

  try {
    let embed = null;

    if (event === 'pull_request' && ['opened','closed','synchronize','merged','review_requested'].includes(payload.action)) {
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
    } else if (event === 'security_advisories' && ['published', 'reported'].includes(payload.action)) {
      embed = securityAdvisoryFormatter.format(payload);
    } else if (event === 'security_advisory' && ['published'].includes(payload.action)) {
      embed = securityAdvisoryFormatter.format(payload);
    } else if (event === 'discussion' && ['created', 'edited', 'answered', 'unanswered'].includes(payload.action)) {
      embed = discussionFormatter.format(payload);
    } else if (event === 'fork') {
      embed = forkFormatter.format(payload);
    } else if (event === 'create' && ['branch', 'tag'].includes(payload.ref_type)) {
      embed = branchFormatter.format(payload);
    } else if (event === 'delete' && ['branch', 'tag'].includes(payload.ref_type)) {
      embed = branchFormatter.format(payload, true);
    } else if (event === 'repository' && ['publicized', 'privatized'].includes(payload.action)) {
      embed = repositoryFormatter.format(payload);
    }

    if (embed) {
      await sendEmbed(webhookFor(event, repoConfig), embed, threadFor(event, repoConfig));
      console.log(`✅ Sent ${event} embed to Discord${repoConfig ? ' (per-repo config)' : ''}`);
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
}

module.exports = { handleWebhook };
