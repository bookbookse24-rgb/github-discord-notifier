/**
 * Security Advisory Formatter
 * GitHub security advisories - vulnerability alerts
 */

function format(payload) {
  const advisory = payload.advisory;
  const repository = payload.repository;
  
  if (!advisory) return null;

  const severityColors = {
    critical: 0xFF0000,
    high: 0xFF6600,
    medium: 0xFFCC00,
    low: 0x0099FF
  };

  const severity = advisory.severity?.toLowerCase() || 'medium';
  const color = severityColors[severity] || severityColors.medium;

  const packages = advisory.vulnerable_package_range 
    ? [advisory.vulnerable_package_range] 
    : advisory.vulnerable_versions 
      ? [advisory.vulnerable_versions]
      : [];

  const embed = {
    title: `🔒 Security Advisory: ${advisory.summary}`,
    color: color,
    fields: [
      {
        name: '📦 Affected Package',
        value: advisory.package?.name || 'Multiple',
        inline: true
      },
      {
        name: '⚡ Severity',
        value: severity.toUpperCase(),
        inline: true
      },
      {
        name: '🔗 Advisory ID',
        value: advisory.ghsa_id || 'N/A',
        inline: true
      }
    ],
    footer: {
      text: `Repository: ${repository?.full_name || 'Unknown'}`
    },
    timestamp: new Date().toISOString()
  };

  if (advisory.cve_id) {
    embed.fields.push({
      name: '🆔 CVE',
      value: advisory.cve_id,
      inline: true
    });
  }

  if (packages.length > 0) {
    embed.fields.push({
      name: '📋 Affected Versions',
      value: packages.slice(0, 3).join('\n'),
      inline: false
    });
  }

  if (advisory.description && advisory.description.length > 0) {
    const truncated = advisory.description.length > 500 
      ? advisory.description.substring(0, 500) + '...'
      : advisory.description;
    embed.description = truncated;
  }

  embed.url = advisory.html_url || `https://github.com/${repository?.full_name}/security/advisories`;

  return embed;
}

module.exports = { format };
