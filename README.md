# 🔔 GitHub Discord Notifier

Get real-time GitHub notifications in your Discord server.

## Features

- **Multi-Event Support**: Issues, PRs, reviews, comments, pushes, releases, branches
- **PR Review States**: Approved, changes requested, commented, pending
- **Branch Events**: Get notified when branches are created or deleted
- **Customizable**: Choose which events trigger notifications
- **Easy Setup**: GitHub App or webhook configuration
- **Rate Limiting**: Free tier: 100 notifications/month
- **Waitlist Signup**: Built-in email capture for early access

## Use Cases

- Team notifications for code reviews
- Issue tracking alerts
- Deployment notifications
- Release announcements
- Branch management alerts

## Pricing

**Free Tier**: 100 notifications/month, all events
**Pro ($9/month)**: Unlimited notifications, priority support

[Join waitlist](#) to get early access!

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Landing page with waitlist signup |
| `/subscribe` | POST | Join waitlist (`{"email": "you@example.com"}`) |
| `/subscribers/count` | GET | Get subscriber counts |
| `/stats/:owner/:repo` | GET | Get notification stats |
| `/webhook` | POST | GitHub webhook receiver |
| `/health` | GET | Health check |

## Quick Start

1. Deploy to Render.com or use Docker
2. Add your Discord webhook URL
3. Configure events to watch

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_WEBHOOK_URL` | Your Discord webhook URL |
| `DISCORD_WEBHOOK_PULL_REQUEST_URL` | Optional: separate webhook for PRs |
| `DISCORD_WEBHOOK_ISSUES_URL` | Optional: separate webhook for issues |
| `GITHUB_WEBHOOK_SECRET` | Webhook secret (optional) |
| `PORT` | Server port (default: 3001) |

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
- `create` - Branch created (ref_type: branch)
- `delete` - Branch deleted (ref_type: branch)
- `check_run` - Check run status changes
- `check_suite` - Check suite status (GitHub Actions CI)
- `fork` - Repository forked
- `discussion` - New discussions, edits, answered/unanswered

## Example Notifications

```
📥 New Issue #42: Bug in login flow
💬 Issue Comment on #42: "Thanks for reporting!"
👀 PR #128: Review requested
✅ PR #130: Approved
🔄 PR #131: Changes requested
🚀 New Release v1.2.0
⚙️ Workflow CI: completed (success)
✅ Check Suite main: success (run #142)
🍴 New Fork: username/repo
⭐ New star from @developer
💬 New Discussion: "How to configure..."
```

## License

MIT
