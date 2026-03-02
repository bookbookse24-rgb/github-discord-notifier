const axios = require('axios');

async function sendEmbed(webhookUrl, embed) {
  if (!webhookUrl) return;
  try {
    await axios.post(webhookUrl, { embeds: [embed] });
  } catch (err) {
    console.error('Discord send error:', err.message);
  }
}

module.exports = { sendEmbed };
