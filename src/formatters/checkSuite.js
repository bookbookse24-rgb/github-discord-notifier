function format(payload) {
  const { check_suite, repository, sender, action } = payload;
  if (!check_suite) return null;

  const statusEmoji = {
    'completed': '✅',
    'in_progress': '🔄',
    'queued': '⏳',
    'requested': '📋',
    'pending': '⏳'
  };

  const conclusionEmoji = {
    'success': '✅',
    'failure': '❌',
    'cancelled': '⚠️',
    'timed_out': '⏱️',
    'action_required': '👀',
    'neutral': '➖',
    'skipped': '⏭️'
  };

  const status = check_suite.status || 'unknown';
  const conclusion = check_suite.conclusion;
  const emoji = conclusion ? (conclusionEmoji[conclusion] || '📊') : (statusEmoji[status] || '📊');

  const branch = check_suite.head_branch;
  const runNumber = check_suite.run_number;
  const runUrl = `https://github.com/${repository.full_name}/actions/runs/${check_suite.run_id}`;

  // Get PR info if this is for a PR
  let prInfo = '';
  if (check_suite.pull_requests?.length > 0) {
    const pr = check_suite.pull_requests[0];
    prInfo = `\n📎 PR [#${pr.number}](${pr.url})`;
  }

  return {
    color: conclusion === 'success' ? 0x22c55e : conclusion === 'failure' ? 0xef4444 : 0xf59e0b,
    title: `${emoji} Check Suite ${status === 'completed' ? conclusion : status}`,
    url: runUrl,
    description: `${emoji} **${branch}** (run #${runNumber})${prInfo}`,
    author: { 
      name: sender?.login || 'GitHub', 
      icon_url: sender?.avatar_url || `https://github.com/github.png`, 
      url: `https://github.com/${sender?.login || 'github'}` 
    },
    fields: [
      { name: 'Status', value: status, inline: true },
      { name: 'Conclusion', value: conclusion || 'in progress', inline: true },
      { name: 'Branch', value: branch, inline: true },
      { name: 'Run Number', value: `#${runNumber}`, inline: true },
    ],
    footer: { text: repository.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
