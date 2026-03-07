function format(payload, isDeleted = false) {
  const { repository, ref, ref_type, sender, pusher, actionSender } = payload;
  
  // Handle both branch and tag events
  const isTag = ref_type === 'tag';
  const isBranch = ref_type === 'branch';
  
  if (!isBranch && !isTag) return null;
  
  const refName = ref.replace('refs/heads/', '').replace('refs/tags/', '');
  const action = payload.action || (payload.created ? 'created' : (payload.deleted ? 'deleted' : 'created'));
  const isCreated = !isDeleted && (action === 'created' || payload.action === 'created');
  
  const color = isCreated ? 0x22c55e : 0xef4444;
  const icon = isTag ? '🏷️' : '🌿';
  const type = isTag ? 'Tag' : 'Branch';
  
  // Add creator info
  const user = isCreated ? (pusher?.name || sender?.login) : (actionSender?.login || 'unknown');
  
  return {
    color,
    title: `${icon} ${type} ${isCreated ? 'Created' : 'Deleted'}`,
    description: `${type} \`${refName}\` was ${isCreated ? 'created' : 'deleted'} in ${repository.full_name}`,
    url: repository.html_url,
    author: { name: 'GitHub Discord Notifier' },
    fields: [
      { name: 'By', value: `\`${user}\``, inline: true },
      { name: 'Type', value: type, inline: true },
      { name: 'Repository', value: `[${repository.full_name}](${repository.html_url})`, inline: true },
    ],
    footer: { text: repository.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
