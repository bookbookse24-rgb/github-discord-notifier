function format(payload) {
  const issue = payload.issue;
  const comment = payload.comment;
  const repo = payload.repository;
  const action = payload.action;

  const colors = { created: 0x3498db, edited: 0xf39c12, deleted: 0xe74c3c };
  const icons = { created: '💬', edited: '✏️', deleted: '🗑️' };

  return {
    color: colors[action] || 0x95a5a6,
    title: `${icons[action] || '💬'} Issue Comment: #${issue.number}`,
    url: comment.html_url,
    description: (comment.body || '').slice(0, 300) || '_No content_',
    author: { name: comment.user.login, icon_url: comment.user.avatar_url, url: comment.user.html_url },
    fields: [
      { name: 'Issue', value: `[#${issue.number}](${issue.html_url})`, inline: true },
      { name: 'Action', value: action, inline: true },
    ],
    footer: { text: repo.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
