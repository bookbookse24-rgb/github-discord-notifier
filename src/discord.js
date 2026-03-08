const axios = require('axios');

async function sendEmbed(webhookUrl, embed, threadId = null) {
  if (!webhookUrl) return;
  try {
    // Discord threads: add /threadId to webhook URL
    let url = webhookUrl;
    if (threadId) {
      // If URL already has query params, add to it
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}thread_id=${threadId}`;
    }
    await axios.post(url, { embeds: [embed] });
  } catch (err) {
    console.error('Discord send error:', err.message);
  }
}

module.exports = { sendEmbed };
