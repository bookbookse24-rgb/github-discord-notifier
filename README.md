# 🔔 GitHub Discord Notifier

Get real-time GitHub notifications in your Discord server.

## Features

- **Multi-Event Support**: Issues, PRs, reviews, comments, pushes, releases
- **PR Review States**: Approved, changes requested, commented, pending
- **Customizable**: Choose which events trigger notifications
- **Easy Setup**: GitHub App or webhook configuration

## Use Cases

- Team notifications for code reviews
- Issue tracking alerts
- Deployment notifications
- Release announcements

## Pricing

**Free Tier**: 1 repo, basic events (issues, PRs, pushes)
**Pro ($9/month)**: Unlimited repositories, all events including:
- Issue comments (created, edited)
- GitHub Actions workflow status
- PR review states
- Release announcements
- Priority support

⏳ Pro access coming soon - [Join waitlist](https://forms.gle/waitlist)

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
