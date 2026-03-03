function format(payload) {
  const workflowRun = payload.workflow_run;
  const repo = payload.repository;
  const action = payload.action;

  const statusColors = {
    completed: workflowRun.conclusion === 'success' ? 0x2ecc71 : 0xe74c3c,
    in_progress: 0xf39c12,
    queued: 0x3498db,
    requested: 0x9b59b6,
  };
  
  const statusIcons = {
    completed: workflowRun.conclusion === 'success' ? '✅' : '❌',
    in_progress: '🔄',
    queued: '⏳',
    requested: '🚀',
  };

  const conclusion = workflowRun.conclusion || action;
  
  return {
    color: statusColors[action] || 0x95a5a6,
    title: `${statusIcons[action] || '⚙️'} Workflow ${conclusion}: ${workflowRun.name}`,
    url: workflowRun.html_url,
    description: `Branch: \`${workflowRun.head_branch}\``,
    author: { name: workflowRun.actor?.login || 'GitHub', icon_url: workflowRun.actor?.avatar_url || '' },
    fields: [
      { name: 'Workflow', value: workflowRun.name, inline: true },
      { name: 'Status', value: conclusion, inline: true },
      { name: 'Branch', value: `\`${workflowRun.head_branch}\``, inline: true },
      { name: 'Conclusion', value: workflowRun.conclusion || 'in progress', inline: true },
    ],
    footer: { text: repo.full_name },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { format };
