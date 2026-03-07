---
title: "GitHub Discord Notifier - Per-repo routing & filters that actually work"
published: true
date: "2026-03-06"
tags: ["github", "discord", "devtools", "automation"]
---

Most GitHub → Discord integrations are either too simple or too expensive. I needed something in between, so I built it.

## The Problem

When you're managing multiple repositories, dumping all notifications into one Discord channel creates chaos. You can't:
- Route specific repos to specific channels
- Filter out noise (bot comments, certain branches)
- Get granular control without paying enterprise prices

## Solution: GitHub Discord Notifier

I built a webhook-based notifier with features that should be standard but aren't:

### Features

- **Per-repo routing** - Each repo can go to a different Discord channel
- **Filter rules** - Filter by branch, label, or author
- **14+ event types** - Issues, PRs, reviews, releases, security advisories, stars, workflow runs, deployments
- **Free tier** - 1 repo, basic events, 100 notifications/month
- **Pro ($29/mo)** - Unlimited repos, all filters, priority support

### Quick Example

Configure per-repo settings via API:

```bash
POST /api/repos/owner/repo/config
{
  "webhookUrl": "https://discord.com/api/webhooks/...",
  "branches": ["main", "develop"],
  "labels": ["bug", "urgent"],
  "excludeAuthors": ["botuser"]
}
```

### Deployment

Deploy to Render.com or run with Docker:

```bash
docker run -d -p 3000:3000 \
  -e DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... \
  ghcr.io/bookbookse24-rgb/github-discord-notifier:latest
```

## What's Missing?

Thinking about adding:
- GitHub App OAuth for one-click install
- Slack support
- Custom notification templates

What would make you switch from your current solution? Let me know in the comments.

[GitHub Repo →](#)
