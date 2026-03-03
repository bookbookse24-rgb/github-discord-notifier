// GitHub Check Runs formatter - for CI/CD status notifications
function format(payload) {
  const checkRun = payload.check_run;
  const repo = payload.repository;
  const action = payload.action;

  const statusColors = {
    completed: checkRun.conclusion === 'success' ? 0x2ecc71 : 
               checkRun.conclusion === 'failure' ? 0xe74c3c :
               checkRun.conclusion === 'cancelled' ? 0x95a5a6 : 0xf39c12,
    in_progress: 0xf39c12,
    queued: 0x3498db,
    requested: 0x9b59b6,
    created: 0x3498db,
  };
  
  const statusIcons = {
    completed: checkRun.conclusion === 'success' ? '✅' : 
               checkRun.conclusion === 'failure' ? '❌' :
               checkRun.conclusion === 'cancelled' ? '⏹️' : '⚠️',
    in_progress: '🔄',
    queued: '⏳',
    requested: '🚀',
    created: '🆕',
  };

  const conclusion = checkRun.conclusion || checkRun.status;
  
  return {
    color: statusColors[action] || statusColors[checkRun.status] || 0x95a5a6,
    title: `${statusIcons[action] || statusIcons[checkRun.status] || '⚙️'} Check ${conclusion}: ${checkRun.name}`,
    url: checkRun.html_url,
    description: checkRun.output?.title || `Check run on \`${checkRun.head_branch}\``,
    author: { name: checkRun.app?.name || 'CI Check', icon_url: checkRun.app?.avatar_url || '' },
    fields: [
      { name: 'Check', value: checkRun.name, inline: true },
      { name: 'Status', value: checkRun.status, inline: true },
      { name: 'Conclusion', value: checkRun.conclusion || 'pending', inline: true },
      { name: 'Branch', value: `\`${checkRun.head_branch}\``, inline: true },
    ],
    footer: { text: repo.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
