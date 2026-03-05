function format(payload) {
  const { repository, ref, sender, pusher, sender: actionSender } = payload;
  const branchName = ref.replace('refs/heads/', '');
  const action = payload.action || (payload.created ? 'created' : 'deleted');
  const isCreated = action === 'created' || payload.action === 'created';
  
  const color = isCreated ? 0x22c55e : 0xef4444;
  
  // Add creator info
  const user = isCreated ? (pusher?.name || sender?.login) : (actionSender?.login || 'unknown');
  
  return {
    color,
    title: `🌿 Branch ${isCreated ? 'Created' : 'Deleted'}`,
    description: `Branch \`${branchName}\` was ${isCreated ? 'created' : 'deleted'} in ${repository.full_name}`,
    url: repository.html_url,
    author: { name: 'GitHub Discord Notifier' },
    fields: [
      { name: 'By', value: `\`${user}\``, inline: true },
      { name: 'Repository', value: `[${repository.full_name}](${repository.html_url})`, inline: true },
    ],
    footer: { text: repository.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
