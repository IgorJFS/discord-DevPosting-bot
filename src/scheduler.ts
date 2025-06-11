import * as cron from 'node-cron';
import { Client, TextChannel, Message } from 'discord.js';
import { fetchRemoteJobs } from './api/fetchVagas';
import { splitMessage } from './utils/messageUtils';
import { reportarErro } from './errorHandler/error';

// Store message IDs to delete them later
let previousMessageIds: string[] = [];
let jobChannelId: string = ''; // This should be set to your job posting channel ID

/**
 * Initialize the job scheduler
 * @param client Discord client instance
 * @param channelId Channel ID where jobs should be posted
 */
export function initializeScheduler(client: Client, channelId: string) {
    jobChannelId = channelId;
    
    // Schedule job posting every 6 hours (0 */6 * * *)
    // For testing, you can use '*/10 * * * * *' for every 10 seconds
    cron.schedule('0 */6 * * *', async () => {
        console.log('🕐 Scheduled job posting started...');
        await postScheduledJobs(client);
    });

    console.log('📅 Job scheduler initialized - posting every 6 hours');
}

/**
 * Posts jobs and manages previous message deletion
 * @param client Discord client instance
 */
async function postScheduledJobs(client: Client) {
    try {
        const channel = await client.channels.fetch(jobChannelId) as TextChannel;
        
        if (!channel) {
            console.error('❌ Job channel not found');
            return;
        }

        // Delete previous messages first
        await deletePreviousMessages(channel);

        // Fetch new jobs
        console.log('🔍 Fetching jobs...');
        const jobs = await fetchRemoteJobs(client);
        
        if (jobs.length === 0) {
            const noJobsMessage = await channel.send("🚫 No Dev Jobs available at the moment.");
            previousMessageIds = [noJobsMessage.id];
            return;
        }

        // Format jobs with borders like in the command
        const resposta = jobs.map(job => {
            const level = getJobLevel(job.title);
            const techStack = job.requirements.slice(0, 5).join(', ');
            const techEmojis = getTechEmojis(job.title, job.requirements);
            
            return `┌────────────────────────────────────────────────────────────┐\n` +
                   `│ **${job.title}** ${level}${techEmojis} on _${job.company}_\n` +
                   `│ 💻 **Tech Stack:** ${techStack || 'Não especificado'}\n` +
                   `│ 🔗 <${job.url}>\n` +
                   `└────────────────────────────────────────────────────────────┘`;
        }).join("\n\n");

        const fullMessage = `🚀 **Devs jobs available** (Updated <t:${Math.floor(Date.now() / 1000)}:R>)\n\n${resposta}`;
        const messageChunks = splitMessage(fullMessage);

        // Send all message chunks and store their IDs
        previousMessageIds = [];
        
        for (let i = 0; i < messageChunks.length; i++) {
            const message = await channel.send(messageChunks[i]);
            previousMessageIds.push(message.id);
            
            // Small delay between messages to avoid rate limiting
            if (i < messageChunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`✅ Posted ${jobs.length} jobs in ${messageChunks.length} messages`);
        
    } catch (error) {
        console.error('❌ Error in scheduled job posting:', error);
        await reportarErro(error, client);
    }
}

/**
 * Delete previous job posting messages
 * @param channel The channel to delete messages from
 */
async function deletePreviousMessages(channel: TextChannel) {
    if (previousMessageIds.length === 0) return;

    try {
        console.log(`🗑️ Deleting ${previousMessageIds.length} previous messages...`);
        
        for (const messageId of previousMessageIds) {
            try {
                const message = await channel.messages.fetch(messageId);
                await message.delete();            } catch (deleteError) {
                // Message might already be deleted or not found, continue
                const errorMsg = deleteError instanceof Error ? deleteError.message : String(deleteError);
                console.log(`⚠️ Could not delete message ${messageId}:`, errorMsg);
            }
        }
        
        previousMessageIds = [];
        console.log('✅ Previous messages deleted');
        
    } catch (error) {
        console.error('❌ Error deleting previous messages:', error);
    }
}

/**
 * Manual trigger for job posting (useful for testing)
 * @param client Discord client instance
 */
export async function triggerJobPosting(client: Client) {
    console.log('🔧 Manually triggering job posting...');
    await postScheduledJobs(client);
}

// Helper functions (copied from bot.ts to avoid circular imports)
function getTechEmojis(title: string, requirements: string[]): string {
    const lowerTitle = title.toLowerCase();
    const lowerRequirements = requirements.map(req => req.toLowerCase());
    const allText = [lowerTitle, ...lowerRequirements].join(' ');
    
    const techEmojis: string[] = [];
    
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
    
    return '⚪ (Mid-level)';
}