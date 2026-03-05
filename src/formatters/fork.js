function format(payload) {
  const { forkee, repository, sender } = payload;
  if (!forkee) return null;

  const fullName = forkee.full_name;
  const description = forkee.description || '_No description_';
  const stars = forkee.stargazers_count || 0;
  const forks = forkee.forks_count || 0;
  const isPrivate = forkee.private ? '🔒' : '🌐';

  return {
    color: 0x7c3aed,
    title: `${isPrivate} New Fork: ${fullName}`,
    url: forkee.html_url,
    description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
    author: { 
      name: sender?.login || 'GitHub', 
      icon_url: sender?.avatar_url || `https://github.com/github.png`, 
      url: `https://github.com/${sender?.login || 'github'}` 
    },
    fields: [
      { name: '⭐ Stars', value: stars.toString(), inline: true },
      { name: '🍴 Forks', value: forks.toString(), inline: true },
      { name: '🔐 Private', value: forkee.private ? 'Yes' : 'No', inline: true },
      { name: 'Owner', value: forkee.owner?.login || 'unknown', inline: true },
    ],
    thumbnail: forkee.owner?.avatar_url ? { url: forkee.owner.avatar_url } : undefined,
    footer: { text: `Forked from ${repository.full_name}` },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
