import chalk from "chalk"; // Pra ficar bonito no terminal
import { Client, GatewayIntentBits, Interaction } from "discord.js"; // Importing necessary classes from discord.js
import dotenv from "dotenv";
import {fetchRemoteJobs} from "./api/fetchVagas"; // Import the function to fetch jobs
import { splitMessage } from "./utils/messageUtils"; // Import the message splitting utility
import { reportarErro } from "./errorHandler/error"; // Import error reporting function
import { initializeScheduler, triggerJobPosting } from "./scheduler"; // Import scheduler functions
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(chalk.blue(`Logged in as 🤖 ${client.user?.tag}!`));
  
  // Initialize the job scheduler
  // Replace 'YOUR_CHANNEL_ID' with the actual channel ID where you want jobs posted
  const jobChannelId = process.env.JOB_CHANNEL_ID || "1382438330209140837";
  initializeScheduler(client, jobChannelId);
});

// Add error handling for the client itself
client.on('error', async (error) => {
  console.error('Discord client error:', error);
  await reportarErro(error, client);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await reportarErro(reason, client);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await reportarErro(error, client);
  process.exit(1);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === "vagas") {
    try {
      await interaction.deferReply(); // Defer the reply to give us time to fetch jobs

      const jobs = await fetchRemoteJobs(client); // Fetch the jobs
      if (jobs.length === 0) {
          await interaction.editReply("🚫 No Dev Jobs at the moment.");
          return;
          }
            const resposta = jobs
        .map(job => {
          const level = getJobLevel(job.title);
          const techStack = job.requirements.slice(0, 5).join(', '); // Show first 5 technologies
          const techEmojis = getTechEmojis(job.title, job.requirements); // Get technology emojis
            return `┌────────────────────────────────────────────────────────────┐\n` +
                 `│ **${job.title}** ${level}${techEmojis} on _${job.company}_\n` +
                 `│ 💻 **Tech Stack:** ${techStack || 'Não especificado'}\n` +
                 `│ 🔗 <${job.url}>\n` +
                 `└────────────────────────────────────────────────────────────┘`;
        })
        .join("\n\n");

      const fullMessage = `🚀 **Devs jobs available**\n\n${resposta}`;
      const messageChunks = splitMessage(fullMessage);

      // Send the first chunk as editReply
      await interaction.editReply(messageChunks[0]);

      // Send remaining chunks as followUp messages
      for (let i = 1; i < messageChunks.length; i++) {
        await interaction.followUp(messageChunks[i]);
      }
    } catch (error) {
      console.error('Error in vagas command:', error);
      await reportarErro(error, client);
      
      // Try to send error message to user
      try {
        const errorMsg = "❌ Ocorreu um erro ao buscar as vagas. Tente novamente mais tarde.";
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
      await reportarErro(error, client);
      await interaction.editReply("❌ Failed to trigger job posting.");
    }
  }
});

/**
 * Identifies programming languages/technologies from job title and requirements
 */
function getTechEmojis(title: string, requirements: string[]): string {
  const lowerTitle = title.toLowerCase();
  const lowerRequirements = requirements.map(req => req.toLowerCase());
  const allText = [lowerTitle, ...lowerRequirements].join(' ');
  
  const techEmojis: string[] = [];
  
  // Check for each technology
  if (allText.includes('react')) techEmojis.push(' <:react:1382419881193898166>');
  if (allText.includes('typescript') || allText.includes('ts')) techEmojis.push(' <:typescript:1382420656179908631>');
  if (allText.includes('javascript') || allText.includes('js')) techEmojis.push(' <:javascript:1382420762501189765>');
  if (allText.includes('java') && !allText.includes('javascript')) techEmojis.push('<:java:1382420621606125628>');
  if (allText.includes('ruby')) techEmojis.push(' <:ruby:1382420784613429288>');
  if (allText.includes('angular')) techEmojis.push(' <:angular:1382420597291876362>');
  if (allText.includes('vue')) techEmojis.push(' <:vue:1382420583547015319>');
  if (allText.includes('golang') || allText.includes(' go ') || allText.includes('go,')) techEmojis.push(' <:golang:1382420575951126589>');
  if (allText.includes('rust')) techEmojis.push(' <:rust:1382420562638405683>');
  if (allText.includes('python')) techEmojis.push(' <:python:1382420691554533376>');
  if (allText.includes('kotlin')) techEmojis.push(' <:kotlin:1382421672681799792>');
  if (allText.includes('flutter')) techEmojis.push(' <:flutter:1382421682685218907>');
  if (allText.includes('postgressql')) techEmojis.push(' <:postgres:1382440623600046231>');
  if (allText.includes('mySQL')) techEmojis.push(' <:mysql:1382440606567104543>');
  if (allText.includes('mongoDB') || allText.includes("mongoose")) techEmojis.push(' <:mongo:1382440616369197086>');
  if (allText.includes('git') || allText.includes("github")) techEmojis.push(' <:githubweb:1382440590968623155>');
  
  return techEmojis.length > 0 ? techEmojis.join('') : '';
}

/**
 * Identifies the job level based on the title
 */
function getJobLevel(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('intern') || lowerTitle.includes('trainee') || lowerTitle.includes('estagiário')) {
    return '🌱 (Intern)';
  }
  if (lowerTitle.includes('junior') || lowerTitle.includes('jr')) {
    return '🟢 (Junior)';
  }
  if (lowerTitle.includes('senior') || lowerTitle.includes('sr')) {
    return '🔵 (Senior)';
  }
  if (lowerTitle.includes('lead') || lowerTitle.includes('principal') || lowerTitle.includes('tech lead')) {
    return '🟡 (Lead/Principal)';
  }
  if (lowerTitle.includes('architect') || lowerTitle.includes('director') || lowerTitle.includes('head')) {
    return '🛑 (Architect/Director)';
  }
  
  return '⚪ (Mid-level)'; // Default for positions without clear level indication
}

client.login(process.env.BOT_TOKEN)
  .catch((error) => {
    console.error(chalk.red("Failed to login:", error));
    process.exit(1);
  });
