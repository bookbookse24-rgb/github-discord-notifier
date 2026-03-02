function format(payload) {
  const issue = payload.issue;
  const repo = payload.repository;
  const action = payload.action;

  const colors = { opened: 0x2ecc71, closed: 0xe74c3c, assigned: 0xf39c12 };
  const icons = { opened: '🐛', closed: '✅', assigned: '👤' };

  return {
    color: colors[action] || 0x95a5a6,
    title: `${icons[action] || '📌'} Issue ${action}: #${issue.number} ${issue.title}`,
    url: issue.html_url,
    description: (issue.body || '').slice(0, 200) || '_No description_',
    author: { name: issue.user.login, icon_url: issue.user.avatar_url, url: issue.user.html_url },
    fields: issue.labels?.length ? [{ name: 'Labels', value: issue.labels.map(l => `\`${l.name}\``).join(', '), inline: true }] : [],
    footer: { text: repo.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
