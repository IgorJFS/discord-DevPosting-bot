import chalk from "chalk"; // For pretty terminal output
import { Client, GatewayIntentBits, Interaction, EmbedBuilder } from "discord.js"; // Importing necessary classes from discord.js
import dotenv from "dotenv";
import { fetchRemoteJobs } from "./api/fetchJobs"; // Import the function to fetch jobs
import { reportError } from "./errorHandler/error"; // Import error reporting function
import { initializeScheduler, triggerJobPosting } from "./scheduler"; // Import scheduler functions
import { getJobLevel, getTechEmojis } from "./utils/jobUtils";
import { clearOnStartup, clearBotMessages } from './maintenance/clearBotMessages';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {
  console.log(chalk.blue(`Logged in as 🤖 ${client.user?.tag}!`));
  // Initialize the job scheduler
  const jobChannelId: any = process.env.JOB_CHANNEL_ID;
  await clearOnStartup(client, jobChannelId);
  initializeScheduler(client, jobChannelId);
});

// Add error handling for the client itself
client.on('error', async (error) => {
  console.error('Discord client error:', error);
  await reportError(error, client);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await reportError(reason, client);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await reportError(error, client);
  process.exit(1);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === "jobs") {
    try {
      await interaction.deferReply(); // Defer the reply to give us time to fetch jobs
      const jobs = await fetchRemoteJobs(client); // Fetch the jobs
      if (jobs.length === 0) {
          await interaction.editReply("🚫 No Dev Jobs at the moment.");
          return;
      }
      
      const embeds = jobs.map(job => {
        const level = getJobLevel(job.title);
        const techStack = job.requirements.slice(0, 5).join(', '); // Show first 5 technologies
        const techEmojis = getTechEmojis(job.title, job.requirements); // Get technology emojis
        
        return new EmbedBuilder()
            .setTitle(job.title)
            .setURL(job.url)
            .setDescription(`**Company:** ${job.company}\n**Level:** ${level}${techEmojis}\n**Tech Stack:** ${techStack || 'Not specified'}`)
            .setColor('#0099ff');
      });

      await interaction.editReply({ content: "🚀 **Devs jobs available**", embeds: embeds.slice(0, 10) });

      for (let i = 10; i < embeds.length; i += 10) {
          await interaction.followUp({ embeds: embeds.slice(i, i + 10) });
      }

    } catch (error) {
      console.error('Error in jobs command:', error);
      await reportError(error, client);
      
      // Try to send error message to user
      try {
        const errorMsg = "❌ An error occurred while fetching jobs. Please try again later.";
        if (interaction.deferred) {
          await interaction.editReply(errorMsg);
        } else {
          await interaction.reply(errorMsg);
        }
      } catch (replyError) {
        console.error('Failed to send error message to user:', replyError);
      }
    }
  }
  
  // Manual trigger for job posting (useful for testing)
  if (interaction.commandName === "trigger-jobs") {
    try {
      await interaction.deferReply();
      await triggerJobPosting(client);
      await interaction.editReply("✅ Job posting triggered manually!");
    } catch (error) {
      console.error('Error in trigger-jobs command:', error);
      await reportError(error, client);
      await interaction.editReply("❌ Failed to trigger job posting.");
    }
  }

  if (interaction.commandName === "clear") {
    try {
      await interaction.deferReply({ ephemeral: true });
      const jobChannelId: any = process.env.JOB_CHANNEL_ID;
      const deleted = await clearBotMessages(client, jobChannelId);
      await interaction.editReply(`🧹 Cleared ${deleted} bot messages from the channel!`);
    } catch (error) {
      await interaction.editReply('❌ Failed to clear messages.');
    }
  }
});

client.login(process.env.BOT_TOKEN)
  .catch((error) => {
    console.error(chalk.red("Failed to login:", error));
    process.exit(1);
  });