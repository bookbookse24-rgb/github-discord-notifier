function format(payload) {
  const pr = payload.pull_request;
  const repo = payload.repository;
  const action = payload.action;

  const colors = { opened: 0x2ecc71, closed: pr.merged ? 0x9b59b6 : 0xe74c3c, review_requested: 0x3498db };
  const color = colors[action] || 0x95a5a6;
  const label = pr.merged ? 'Merged' : action.charAt(0).toUpperCase() + action.slice(1);

  return {
    color,
    title: `🔀 PR ${label}: #${pr.number} ${pr.title}`,
    url: pr.html_url,
    description: (pr.body || '').slice(0, 200) || '_No description_',
    author: { name: pr.user.login, icon_url: pr.user.avatar_url, url: pr.user.html_url },
    fields: [
      { name: 'Branch', value: `\`${pr.head.ref}\` → \`${pr.base.ref}\``, inline: true },
      { name: 'Changes', value: `+${pr.additions || 0} / -${pr.deletions || 0}`, inline: true },
    ],
    footer: { text: repo.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
