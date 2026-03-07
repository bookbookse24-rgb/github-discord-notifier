# 🔔 GitHub Discord Notifier

Get real-time GitHub notifications in your Discord server.

## Features

- **Multi-Event Support**: Issues, PRs, reviews, comments, pushes, releases
- **PR Review States**: Approved, changes requested, commented, pending
- **Customizable**: Choose which events trigger notifications
- **Per-Repo Configuration** (Pro): Route different repos to different Discord channels
- **Filter Rules** (Pro): Filter by branch, label, or author
- **Easy Setup**: GitHub App or webhook configuration

## Pricing

**Free Tier**: 1 repo, basic events (issues, PRs, pushes), 100 notifications/month
**Pro ($29/month)**: Unlimited repositories, all events, per-repo config, filters, priority support

👉 [Get Pro on Gumroad](https://your-gumroad-link.com)

## Pro Features

- **Unlimited repositories** - Connect as many repos as you need
- **Per-repo webhook URLs** - Route different repos to different Discord channels
- **Filter by branch** - Only get notified for specific branches (e.g., `main`, `develop`)
- **Filter by label** - Only notify on issues/PRs with specific labels
- **Exclude authors** - Mute notifications from specific users
- **Custom event selection** - Choose exactly which events to receive
- **Priority support** - Get help when you need it

## API Endpoints

### Configure per-repo settings (Pro)
```bash
POST /api/repos/:owner/:repo/config
{
  "webhookUrl": "https://discord.com/api/webhooks/...",
  "branches": ["main", "develop"],
  "labels": ["bug", "urgent"],
  "excludeAuthors": ["botuser"],
  "events": ["pull_request", "issues"],
  "email": "your@email.com"
}
```

### Get dashboard stats
```bash
GET /api/dashboard?email=your@email.com
```

### Create Stripe checkout
```bash
POST /create-checkout-session
{
  "email": "your@email.com",
  "tier": "pro"
}
```

## Quick Start

1. Deploy to Render.com or use Docker
2. Add your Discord webhook URL
3. Configure events to watch

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_WEBHOOK_URL` | Your Discord webhook URL |
| `GITHUB_WEBHOOK_SECRET` | Webhook secret (optional) |
| `EVENTS` | Comma-separated events (issues,pull_request,release) |

## Deploy

### Docker
```bash
docker run -d -p 3000:3000 \
  -e DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... \
  -e GITHUB_WEBHOOK_SECRET=secret \
  ghcr.io/bookbookse24-rgb/github-discord-notifier:latest
```

### Render
Connect your GitHub repo to Render.com

## Supported Events

- `issues` - Issue opened, closed, labeled
- `issue_comment` - Comments on issues (new, edited)
- `pull_request` - PR opened, closed, merged
- `pull_request_review` - Reviews (approved, changes requested, commented)
- `push` - Code pushes
- `release` - New releases
- `commit_comment` - Commit comments
- `workflow_run` - GitHub Actions workflow status
- `deployment` - Deployment created
- `deployment_status` - Deployment success/failure/pending
- `star` - New stars
- `fork` - Repository forked
- `create` - Branch or tag created
- `delete` - Branch or tag deleted
- `repository` - Repository visibility changed (public/private)
- `security_advisories` - GitHub security vulnerability advisories
- `security_advisory` - Security advisory published
- `discussion` - GitHub Discussions (new, edited, answered)

## New in v1.2.0

- **Health Check Endpoint**: `GET /health` for deployment monitoring
- **Metrics Endpoint**: `GET /metrics` for usage stats
- **New Events**: Fork, branch/tag create/delete, repository visibility changes

## Example Notifications

```
📥 New Issue #42: Bug in login flow
💬 Issue Comment on #42: "Thanks for reporting!"
👀 PR #128: Review requested
✅ PR #130: Approved
🔄 PR #131: Changes requested
🚀 New Release v1.2.0
⚙️ Workflow CI: completed (success)
⭐ New star from @developer
```

## License

MIT
