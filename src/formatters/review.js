function format(payload) {
  const { review, pull_request, repository } = payload;
  const author = review.user.login;
  const state = review.state; // approved, changes_requested, commented, pending
  const body = review.body || 'No review comment';
  
  const stateEmoji = {
    approved: '✅',
    changes_requested: '🔴',
    commented: '💬',
    pending: '⏳'
  };
  
  const color = {
    approved: 3066993,   // green
    changes_requested: 15158398, // red
    commented: 0,        // default
    pending: 16776960    // yellow
  };

  return {
    title: `PR Review: ${pull_request.title}`,
    url: pull_request.html_url,
    description: body.substring(0, 200),
    color: color[state] || 0,
    author: {
      name: author,
      icon_url: review.user.avatar_url
    },
    fields: [
      {
        name: 'Repository',
        value: repository.full_name,
        inline: true
      },
      {
        name: 'State',
        value: `${stateEmoji[state] || ''} ${state.replace('_', ' ')}`,
        inline: true
      },
      {
        name: 'PR #',
        value: pull_request.number.toString(),
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  };
}

module.exports = { format };
