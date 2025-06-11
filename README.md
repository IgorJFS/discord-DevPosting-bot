# 🤖 Discord Job Bot

A Discord bot that automatically fetches and posts IT/Developer job listings from RemoteOK.com. The bot filters for legitimate development positions and presents them with beautiful formatting, tech stack emojis, and automatic scheduling.

## 🚀 Features

### 📋 Job Listing Features
- **Smart Filtering**: Only shows legitimate IT/Developer positions (no marketing, sales, or non-tech roles)
- **Job Level Detection**: Automatically identifies and displays job levels with emojis:
  - 🌱 Intern/Trainee positions
  - 🟢 Junior developers
  - ⚪ Mid-level positions
  - 🔵 Senior developers
  - 🟡 Lead/Principal engineers
  - 🛑 Architect/Director roles

### 💻 Tech Stack Recognition
The bot automatically detects and displays technology emojis for:
- **Languages**: JavaScript, TypeScript
- **Frameworks**: express, discord.js
- **Tools**: Git/GitHub, REST APIs

### 🕐 Automatic Scheduling
- Posts fresh job listings every 6 hours
- Automatically deletes previous messages to keep channels clean
- Shows "Updated X minutes ago" timestamps

### 🔧 Manual Commands
- `/vagas` - Fetch and display current job listings
- `/trigger-jobs` - Manually trigger scheduled job posting (for testing)

### 📊 Error Reporting
- Automatic error reporting via Discord webhooks
- Beautiful error embeds with stack traces and timestamps
- Comprehensive error handling for all bot operations

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm (comes with Node.js)
- TypeScript
- Discord Application with Bot Token

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd Bot-discord
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
JOB_CHANNEL_ID=your_job_posting_channel_id_here
```

### 3. Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token to your `.env` file
5. Copy the application ID to your `.env` file as CLIENT_ID

### 4. Get Channel ID
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on the channel where you want job postings → Copy ID
3. Add this ID to your `.env` file as JOB_CHANNEL_ID

### 5. Bot Permissions
Your bot needs these permissions:
- Send Messages
- Use Slash Commands
- Manage Messages (to delete old job postings)
- Embed Links

## 🛠️ Development

### Build and Run
```bash
# Development mode with auto-restart
npm run dev

# Build TypeScript
npm run build

# Run production
npm start
```

### Project Structure
```
src/
├── bot.ts              # Main bot file with commands and client setup
├── scheduler.ts        # Cron job scheduler for automatic posting
├── api/
│   └── fetchVagas.ts   # RemoteOK API integration and job filtering
├── errorHandler/
│   └── error.ts        # Error reporting via Discord webhooks
└── utils/
    └── messageUtils.ts # Message chunking utilities
```

## ⚙️ Configuration

### Scheduling
The bot posts jobs every 6 hours by default. To change this, modify the cron expression in `scheduler.ts`:
```typescript
// Every 6 hours (default)
cron.schedule('0 */6 * * *', async () => {

// Every hour (example)
cron.schedule('0 * * * *', async () => {

// Every 10 seconds (testing)
cron.schedule('*/10 * * * * *', async () => {
```

### Job Filtering
The bot includes sophisticated filtering in `fetchVagas.ts`:
- **Excluded keywords**: Marketing, sales, accounting, legal, HR, etc.
- **Required keywords**: Developer, engineer, programmer, specific technologies
- **Smart exceptions**: Technical managers and tech designers are allowed

## 📱 Usage

### Commands
Once the bot is running and invited to your server:

1. **Manual Job Search**:
   ```
   /vagas
   ```
   Fetches and displays current job listings immediately.

2. **Test Scheduler**:
   ```
   /trigger-jobs
   ```
   Manually triggers the scheduled job posting (useful for testing).

### Job Display Format
Jobs are displayed with beautiful bordered formatting:
```
┌────────────────────────────────────────────────────────────┐
│ **Senior React Developer** 🔵 (Senior) :react: :typescript: on _TechCorp_
│ 💻 **Tech Stack:** React, TypeScript, Node.js, AWS, Docker
│ 🔗 <https://example.com/job>
└────────────────────────────────────────────────────────────┘
```

## 🐛 Error Handling

The bot includes comprehensive error handling:
- **Webhook Integration**: Errors are automatically sent to Discord via webhook
- **Rich Error Reports**: Include error messages, stack traces, and timestamps
- **Graceful Degradation**: Bot continues working even if individual features fail
- **User-Friendly Messages**: Users see helpful error messages instead of technical details

## 📊 Monitoring

### Error Webhook Setup
1. Create a Discord webhook in your error reporting channel
2. Update the webhook URL in `src/errorHandler/error.ts`
3. All errors will be automatically reported with detailed information

### Logs
The bot logs important events to console:
- Bot startup and login
- Scheduled job executions
- Job fetch results
- Error occurrences

## 🔧 Customization

### Adding New Tech Emojis
In `bot.ts` and `scheduler.ts`, update the `getTechEmojis()` function:
```typescript
if (allText.includes('your-tech')) techEmojis.push(' <:your-emoji:emoji-id>');
```

### Modifying Job Filters
In `fetchVagas.ts`, update the `isDeveloperJob()` function:
- Add to `excludedKeywords` to filter out unwanted jobs
- Add to `itKeywords` to include new tech terms

### Changing Message Format
Update the job formatting in both `bot.ts` and `scheduler.ts` in the message building sections.

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

If you encounter issues:
1. Check the error reporting channel for detailed error information
2. Verify your `.env` configuration
3. Ensure the bot has proper Discord permissions
4. Check the console logs for additional debugging information