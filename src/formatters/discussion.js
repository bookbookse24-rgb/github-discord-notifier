/**
 * GitHub Discussions Formatter
 * Formats discussion events for Discord webhooks
 * 
 * Events: created, edited, answered, unanswered
 */

function format(payload) {
  const { action, discussion, repository, sender } = payload;
  
  if (!discussion || !repository) return null;
  
  const repoName = repository.full_name;
  const discussionUrl = discussion.url || discussion.html_url;
  const category = discussion.category?.name || 'General';
  const author = sender?.login || 'unknown';
  const authorAvatar = sender?.avatar_url || '';
  
  // Color based on action
  const colors = {
    created: 0x00FF00,    // Green
    edited: 0xFFAA00,     // Orange
    answered: 0x00AAFF,   // Blue
    unanswered: 0xFF5555 // Red
  };
  
  const color = colors[action] || 0x7289DA;
  
  // Build the embed
  const embed = {
    embeds: [{
      title: `💬 Discussion ${action === 'created' ? 'Started' : action}`,
      description: `**${discussion.title}**`,
      url: discussionUrl,
      color: color,
      author: {
        name: author,
        icon_url: authorAvatar
      },
      fields: [
        {
          name: '📁 Category',
          value: category,
          inline: true
        },
        {
          name: '💭 Comments',
          value: discussion.comments || 0,
          inline: true
        }
      ],
      footer: {
        text: repoName
      },
      timestamp: new Date().toISOString()
    }]
  };
  
  // Add body preview for new discussions
  if (action === 'created' && discussion.body) {
    const bodyPreview = discussion.body.substring(0, 200);
    embed.embeds[0].fields.push({
      name: '📝 Preview',
      value: bodyPreview + (discussion.body.length > 200 ? '...' : '')
    });
  }
  
  // Add answer info for answered/unanswered
  if (action === 'answered' && discussion.answer) {
    embed.embeds[0].fields.push({
      name: '✅ Marked as Answer',
      value: 'This discussion has been answered!'
    });
  }
  
  return embed;
}

module.exports = { format };
