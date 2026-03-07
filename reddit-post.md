---
title: "Built a GitHub → Discord notifier with per-repo routing (free + paid tiers) - Now with 18+ events"
author: devto
subreddit: programming
---

**Background**

Got tired of all my repo notifications dumping into one Discord channel. Existing tools either didn't have per-repo routing or charged enterprise prices for it.

**What I built**

A webhook-based GitHub Discord notifier with:
- Per-repo channel routing (route repo A to channel X, repo B to channel Y)
- Filters: branch, label, author
- **18+ event types**: issues, PRs, reviews, releases, security advisories, stars, workflow runs, deployments, forks, branch/tag create/delete, repo visibility, discussions
- **New in v1.2.0**: Health check + metrics endpoints
- Free tier: 1 repo, 100/month
- Pro ($29/mo): unlimited repos, all filters

**Tech stack**: Node.js, Express, Discord webhooks

**New events in v1.2.0:**
- 🍴 Fork notifications
- 🌿 Branch/tag created/deleted  
- 🔒 Repository made public/private
- 💬 GitHub Discussions
- ⚙️ Health check `/health` and `/metrics` endpoints

**Links**:
- GitHub: https://github.com/bookbookse24-rgb/github-discord-notifier

**Question for the thread**: What GitHub notification tool are you using? What's missing that would make you switch?

---
*(Mods: feel free to remove if not allowed - just sharing something I built)*
