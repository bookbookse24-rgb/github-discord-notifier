function format(payload) {
  const deployment = payload.deployment;
  const environment = deployment.environment;
  const status = payload.deployment_status.state;
  
  const statusEmoji = {
    success: '✅',
    failure: '❌',
    pending: '⏳',
    error: '⚠️',
    inactive: '🔴',
    queued: '📝'
  };
  
  const statusText = {
    success: 'deployed successfully',
    failure: 'deployment failed',
    pending: 'deployment pending',
    error: 'deployment error',
    inactive: 'deactivated',
    queued: 'queued for deployment'
  };
  
  const emoji = statusEmoji[status] || '📦';
  const text = statusText[status] || 'updated';
  
  return {
    title: `${emoji} Deployment ${text}`,
    description: `\`${deployment.description || deployment.ref}\` to \`${environment}\``,
    color: status === 'success' ? 3066993 : status === 'failure' ? 15158332 : 3447003,
    fields: [
      { name: 'Repository', value: payload.repository.full_name, inline: true },
      { name: 'Environment', value: environment, inline: true },
      { name: 'Ref', value: deployment.ref, inline: true }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: payload.repository.full_name }
  };
}

module.exports = { format };
