import * as cron from 'node-cron';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { fetchRemoteJobs } from './api/fetchJobs';
import { reportError } from './errorHandler/error';
import { getJobLevel, getTechEmojis } from "./utils/jobUtils";

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

        const embeds = jobs.map(job => {
            const level = getJobLevel(job.title);
            const techStack = job.requirements.slice(0, 5).join(', ');
            const techEmojis = getTechEmojis(job.title, job.requirements);
            
            return new EmbedBuilder()
                .setTitle(job.title)
                .setURL(job.url)
                .setDescription(`**Company:** ${job.company}\n**Level:** ${level}${techEmojis}\n**Tech Stack:** ${techStack || 'Not specified'}`)
                .setColor('#0099ff');
        });

        previousMessageIds = [];
        for (let i = 0; i < embeds.length; i += 10) {
            const message = await channel.send({ embeds: embeds.slice(i, i + 10) });
            previousMessageIds.push(message.id);
        }

        console.log(`✅ Posted ${jobs.length} jobs`);
        
    } catch (error) {
        console.error('❌ Error in scheduled job posting:', error);
        await reportError(error, client);
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
                await message.delete();
            } catch (deleteError) {
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