# I built a GitHub → Discord notifier with per-repo routing and filters

After frustrations with existing GitHub Discord integrations, I built one that actually solves real problems:

**The Problem:**
- All repos go to one channel → chaos
- No way to filter noise (bot comments, specific branches)
- Limited event types on free tiers of other tools

**What I built:**
- Route different repos to different Discord channels
- Filter by branch, label, or author
- Support for 14+ event types (issues, PRs, reviews, releases, security advisories, stars, workflow runs, deployments...)
- Free tier: 1 repo, 100 notifications/month
- Pro ($29/mo): unlimited repos, all filters, priority support

**Tech:** Node.js, Express, Discord webhooks

Would love feedback. Been thinking about adding:
- GitHub App OAuth (instead of manual webhook setup)
- Slack support
- Custom notification templates

Link: [GitHub repo]

Curious - what GitHub notification tools are you using? What missing features would make you switch?

---
Edit: Added deployment docs for Render and Docker
