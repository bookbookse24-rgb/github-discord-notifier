function format(payload) {
  const repo = payload.repository;
  const sender = payload.sender;

  return {
    color: 0xf39c12,
    title: `⭐ ${sender.login} starred ${repo.full_name}`,
    url: repo.html_url,
    description: `Total stars: **${repo.stargazers_count}**`,
    author: { name: sender.login, icon_url: sender.avatar_url, url: sender.html_url },
    footer: { text: repo.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
