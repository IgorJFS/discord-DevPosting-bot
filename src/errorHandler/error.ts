import { Client } from 'discord.js';
import axios from 'axios';

export async function reportarErro(error: unknown, client?: Client) {
  const webhookUrl = "https://discord.com/api/1382445464963780669/KNw-iw";
  
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    const payload = {
      content: "🚨 **Bot Error Detected**",
      embeds: [
        {
          title: "❗ Error Report",
          description: `\`\`\`js\n${errorMessage}\n\`\`\``,
          color: 0xFF0000, // Red color
          fields: [
            {
              name: "Stack Trace",
              value: `\`\`\`js\n${errorStack ? errorStack.substring(0, 1000) : 'No stack trace'}\n\`\`\``,
              inline: false
            },            {
              name: "Timestamp",
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: true
            }
          ],
          footer: {
            text: "Bot Error Handler"
          }
        }
      ]
    };

    await axios.post(webhookUrl, payload);
  } catch (reportingError) {
    console.error('Failed to report error to Discord webhook:', reportingError);
  }
}
