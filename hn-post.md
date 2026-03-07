# I built a GitHub → Discord notifier with per-repo routing and filters (now with 18+ events)

After frustrations with existing GitHub Discord integrations, I built one that actually solves real problems:

**The Problem:**
- All repos go to one channel → chaos
- No way to filter noise (bot comments, specific branches)
- Limited event types on free tiers of other tools

**What I built:**
- Route different repos to different Discord channels
- Filter by branch, label, or author
- Support for 18+ event types (issues, PRs, reviews, releases, security advisories, stars, workflow runs, deployments, forks, branch/tag create/delete, repo visibility changes, discussions...)
- **New in v1.2.0**: Health check endpoint + metrics for deployment monitoring
- Free tier: 1 repo, 100 notifications/month
- Pro ($29/mo): unlimited repos, all filters, priority support

**Tech:** Node.js, Express, Discord webhooks

**New Events Added:**
- 🍴 Fork notifications
- 🌿 Branch/tag created/deleted
- 🔒 Repository made public/private
- 💬 GitHub Discussions

Link: https://github.com/bookbookse24-rgb/github-discord-notifier

Would love feedback. What GitHub notification tools are you using? What missing features would make you switch?
