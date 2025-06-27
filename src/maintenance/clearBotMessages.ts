import { Client, TextChannel, Message, Collection } from 'discord.js';

/**
 * Deletes all messages sent by the bot in the specified channel.
 * @param client Discord client instance
 * @param channelId Channel ID to clear
 * @returns Number of messages deleted
 */
export async function clearBotMessages(client: Client, channelId: string): Promise<number> {
  const channel = await client.channels.fetch(channelId);
  if (!channel || channel.type !== 0) return 0; // 0 = GuildText
  const textChannel = channel as TextChannel;
  let deletedCount = 0;

  // Discord only allows bulk delete for messages < 14 days old and up to 100 at a time
  let lastId: string | undefined = undefined;
  while (true) {
    const options: any = { limit: 100 };
    if (lastId) options.before = lastId;
    const messages = await textChannel.messages.fetch(options);
    // If not a collection, break
    if (!(messages instanceof Collection)) break;
    if (messages.size === 0) break;
    const botMessages = messages.filter((m: Message) => m.author.id === client.user?.id);
    for (const msg of botMessages.values()) {
      try {
        await msg.delete();
        deletedCount++;
      } catch {}
    }
    lastId = messages.last()?.id;
    if (!lastId) break;
  }
  return deletedCount;
}

/**
 * Deletes all bot messages in the channel on startup
 */
export async function clearOnStartup(client: Client, channelId: string) {
  const deleted = await clearBotMessages(client, channelId);
  if (deleted > 0) {
    console.log(`🧹 Cleared ${deleted} old bot messages on startup.`);
  }
}
