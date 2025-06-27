import axios from 'axios';
import { reportError } from '../errorHandler/error';
import { Client } from 'discord.js';

type Job = {
    title: string;
    company: string;
    url: string;
    requirements: string[];
};

export async function fetchRemoteJobs(client?: Client): Promise<Job[]> {
    try {
        const response = await axios.get('https://remoteok.com/api');
        const allJobs = response.data;

        // Primeira posição é metadado, removemos com slice(1)
        const jobs = allJobs.slice(1);

        // Filter for developer jobs only
        const developerJobs = jobs.filter((job: any) => isDeveloperJob(job));

        return developerJobs.map((job: any) => ({
            title: job.position || job.title || 'Título não disponível',
            company: job.company || 'Empresa não informada',
            url: job.url || '',
            requirements: job.tags || [], // normalmente tecnologias vêm nos "tags"
        }));
    } catch (error) {
        console.error('Error fetchings Job Posts:', error);
        
        // Report error to Discord if client is available
        if (client) {
            await reportError(error, client);
        }
        
        return [];
    }
}

/**
 * Checks if a job is a legitimate IT/tech position, excluding non-technical roles
 */
function isDeveloperJob(job: any): boolean {
    const title = (job.position || job.title || '').toLowerCase();
    const tags = (job.tags || []).map((tag: string) => tag.toLowerCase());
    const allText = [title, ...tags].join(' ');
    
    // First, exclude non-IT jobs explicitly
    const excludedKeywords = [
        'marketing', 'sales', 'account', 'accounting', 'finance', 'legal', 'lawyer',
        'hr', 'human resources', 'recruiter', 'recruitment', 'business development',
        'content writer', 'copywriter', 'customer service', 'support agent',
        'project manager', 'business analyst', 'consultant', 'advisor',
        'designer', 'graphic designer', 'ui designer', 'ux designer', // unless specifically tech
        'manager', 'director', 'executive', 'ceo', 'cto', 'cfo',
        'operations', 'logistics', 'procurement', 'vendor'
    ];
    
    // Check if job contains excluded keywords (immediate rejection)
    const hasExcludedKeywords = excludedKeywords.some(keyword => 
        allText.includes(keyword) && !isITException(allText, keyword)
    );
    
    if (hasExcludedKeywords) {
        return false;
    }
    
    // IT/Tech position keywords - must have at least one
    const itKeywords = [
        // Programming roles
        'developer', 'programmer', 'engineer', 'coder', 'architect',
        
        // Specific tech roles
        'frontend', 'backend', 'fullstack', 'full-stack', 'full stack',
        'software engineer', 'web developer', 'mobile developer',
        'devops', 'sre', 'site reliability', 'platform engineer',
        'data engineer', 'data scientist', 'ml engineer', 'ai engineer',
        'security engineer', 'cybersecurity', 'infosec',
        'qa engineer', 'test engineer', 'automation engineer',
        'cloud engineer', 'infrastructure engineer', 'system administrator',
        
        // Programming languages
        'javascript', 'typescript', 'python', 'java', 'c#', 'c++',
        'php', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'scala',
        
        // Frameworks and technologies
        'react', 'vue', 'angular', 'node', 'express', 'django', 'flask',
        'spring', 'laravel', 'rails', 'dotnet', '.net',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform',
        'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
        
        // Mobile development
        'ios', 'android', 'flutter', 'react native', 'xamarin',
        
        // Level indicators (when combined with tech context)
        'junior developer', 'senior developer', 'lead developer',
        'principal engineer', 'staff engineer', 'tech lead'
    ];
    
    // Check if job contains IT keywords
    const hasITKeywords = itKeywords.some(keyword => 
        allText.includes(keyword)
    );
    
    return hasITKeywords;
}

/**
 * Check if an excluded keyword is actually acceptable in IT context
 */
function isITException(text: string, keyword: string): boolean {
    switch (keyword) {
        case 'designer':
        case 'ui designer':
        case 'ux designer':
            // Allow if it mentions tech/development
            return text.includes('web') || text.includes('frontend') || 
                   text.includes('react') || text.includes('vue') || text.includes('angular');
        
        case 'manager':
        case 'director':
            // Allow technical management roles
            return text.includes('engineering') || text.includes('technical') || 
                   text.includes('development') || text.includes('software') ||
                   text.includes('tech') || text.includes('it') || text.includes('platform');
        
        case 'business analyst':
            // Allow technical BA roles
            return text.includes('technical') || text.includes('system') || text.includes('data');
        
        default:
            return false;
    }
}

