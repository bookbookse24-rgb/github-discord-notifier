title: "Built a GitHub → Discord notifier with per-repo routing (free + paid tiers)"
author: devto
 subreddit: programming
    ---

**Background**

Got tired of all my repo notifications dumping into one Discord channel. Existing tools either didn't have per-repo routing or charged enterprise prices for it.

**What I built**

A webhook-based GitHub Discord notifier with:
- Per-repo channel routing (route repo A to channel X, repo B to channel Y)
- Filters: branch, label, author
- 14 event types: issues, PRs, reviews, releases, security advisories, stars, workflow runs, deployments
- Free tier: 1 repo, 100/month
- Pro ($29/mo): unlimited repos, all filters

**Tech stack**: Node.js, Express, Discord webhooks

**Links**:
- GitHub: [repo link]
- Demo notification formats in README

**Question for the thread**: What GitHub notification tool are you using? What's missing that would make you switch?

---
*(Mods: feel free to remove if not allowed - just sharing something I built)*
