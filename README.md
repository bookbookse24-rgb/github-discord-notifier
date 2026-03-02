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

**$9/month** - Unlimited repositories, all events

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
- `pull_request` - PR opened, closed, merged
- `pull_request_review` - Reviews (approved, changes requested, commented)
- `push` - Code pushes
- `release` - New releases
- `commit_comment` - Commit comments

## Example Notifications

```
📥 New Issue #42: Bug in login flow
👀 PR #128: Review requested
✅ PR #130: Approved
🔄 PR #131: Changes requested
🚀 New Release v1.2.0
```

## License

MIT
