function format(payload) {
  const { repository, sender, action } = payload;
  if (!repository) return null;

  const isPrivate = repository.private;
  const visibility = isPrivate ? '🔒 Private' : '🌐 Public';
  const actionType = action === 'publicized' ? 'made public' : (action === 'privatized' ? 'made private' : 'updated');

  return {
    color: isPrivate ? 0xef4444 : 0x22c55e,
    title: `${visibility} Repository ${actionType}`,
    description: `**[${repository.full_name}](${repository.html_url})** was ${actionType}`,
    url: repository.html_url,
    author: { 
      name: sender?.login || 'GitHub', 
      icon_url: sender?.avatar_url || `https://github.com/github.png` 
    },
    fields: [
      { name: 'Visibility', value: isPrivate ? '🔒 Private' : '🌐 Public', inline: true },
      { name: 'Stars', value: (repository.stargazers_count || 0).toString(), inline: true },
      { name: 'Forks', value: (repository.forks_count || 0).toString(), inline: true },
    ],
    thumbnail: repository.owner?.avatar_url ? { url: repository.owner.avatar_url } : undefined,
    footer: { text: repository.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
