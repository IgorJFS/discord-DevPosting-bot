/**
 * Identifies programming languages/technologies from job title and requirements
 */
export function getTechEmojis(title: string, requirements: string[]): string {
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
export function getJobLevel(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('freelancer') || lowerTitle.includes('freelance') || lowerTitle.includes('freelancers')) {
    return '💵 (Freelance)';
  }
  if (lowerTitle.includes('volunteer') || lowerTitle.includes('voluntário') || lowerTitle.includes('unpaid')) {
    return '❤️ (Volunteer)';
  }
  if (lowerTitle.includes('intern') || lowerTitle.includes('trainee') || lowerTitle.includes('estagiário') || lowerTitle.includes('estágio')) {
    return '🌱 (Intern)';
  }
  if (lowerTitle.includes('junior') || lowerTitle.includes('jr') || lowerTitle.includes('entry-level')) { 
    return '🟢 (Junior)';
  }
  if (lowerTitle.includes('mid-level') || lowerTitle.includes('mid') || lowerTitle.includes('mid-level') || lowerTitle.includes('midlevel') || lowerTitle.includes('mid level') || lowerTitle.includes('pleno')) {
    return '🟣 (Mid-level)';
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
  if (lowerTitle.includes('developer') || lowerTitle.includes('desenvolvedor') || lowerTitle.includes('dev') ){
    return '💻 (Developer (check post for position))';
  } 
  if (lowerTitle.includes('engineer') || lowerTitle.includes('engenheiro') || lowerTitle.includes('SWE') ){
    return '🔧 (Software Engineer)';
  } 
  
  return '⚪ (Unknown Position)'; // Default for positions without clear level indication
  }


  /* posso escrever esse código dessa maneira tambem

  const tagGroups = [
  { keywords: ['freelancer', 'freelance', 'freelancers'], tag: '💵 (Freelance)' },
  { keywords: ['volunteer', 'voluntário'], tag: '❤️ (Volunteer)' },
  { keywords: ['enginner', 'engenheiro', 'swe'], tag: '🔧 (Software Engineer)' },
  { keywords: ['intern', 'trainee', 'estagiário', 'estágio', 'unpaid'], tag: '🌱 (Intern)' },
  { keywords: ['junior', 'jr', 'entry-level'], tag: '🟢 (Junior)' },
  { keywords: ['mid-level', 'mid', 'midlevel', 'mid level', 'pleno'], tag: '🟣 (Mid-level)' },
  { keywords: ['senior', 'sr'], tag: '🔵 (Senior)' },
  { keywords: ['lead', 'principal', 'tech lead'], tag: '🟡 (Lead/Principal)' },
  { keywords: ['architect', 'director', 'head'], tag: '🛑 (Architect/Director)' },
];

export function getJobLevel(title: string): string {
  const lowerTitle = title.toLowerCase();

  const matchedGroup = tagGroups.find(group =>
    group.keywords.some(keyword => lowerTitle.includes(keyword))
  );

  return matchedGroup?.tag || '⚪ (Unknown Position)';
}
  */