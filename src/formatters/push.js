function format(payload) {
  const repo = payload.repository;
  const branch = payload.ref.replace('refs/heads/', '');
  const commits = (payload.commits || []).slice(0, 5);

  return {
    color: 0x3498db,
    title: `📦 Push to \`${branch}\``,
    url: payload.compare,
    description: commits.map(c => `[\`${c.id.slice(0,7)}\`](${c.url}) ${c.message.split('\n')[0]}`).join('\n') || '_No commits_',
    author: { name: payload.pusher.name, icon_url: `https://github.com/${payload.pusher.name}.png`, url: `https://github.com/${payload.pusher.name}` },
    fields: [{ name: 'Commits', value: `${payload.commits?.length || 0}`, inline: true }],
    footer: { text: repo.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
