function format(payload) {
  const release = payload.release;
  const repo = payload.repository;

  return {
    color: 0xf1c40f,
    title: `🚀 Release: ${release.tag_name} — ${release.name || ''}`,
    url: release.html_url,
    description: (release.body || '').slice(0, 300) || '_No release notes_',
    author: { name: release.author.login, icon_url: release.author.avatar_url },
    footer: { text: repo.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
