# Deno Grammy Starter Bot

The **Deno Grammy Starter Bot** is an open-source starter kit designed to accelerate the development of Telegram bots using [GrammyJs](https://grammy.dev/), TypeScript 5.8.3, and the Deno 2.4.0 runtime. It provides a modular foundation with essential features such as middleware for user profile management, and database integration with Deno KV and AWS S3. Developers can clone this repository and customize it to quickly bootstrap their own Telegram bot projects. See the [LICENSE](./LICENSE) file for licensing details.

## Features
- **GrammyJs Framework**: Built with a modern Telegram bot framework for robust bot development.
- **TypeScript**: Fully typed codebase for better maintainability and developer experience.
- **Deno KV**: Persistent storage for user profiles, CGU (Terms of Use) agreements, and activity logs.
- **AWS S3 Integration**: Storage for conversation files and Deno KV backups.
- **Modular Structure**: Organized into commands, conversations, middlewares, and services for easy extension.
- **Localization**: Supports English and French via Fluent (.ftl) files.
- **Admin Commands**: Restricted commands for administrators (e.g., `/info`).
- **Conversations**: Interactive flows for CGU acceptance and profile creation.
- **Maintenance Mode**: Middleware to handle maintenance periods.

## Demo
To test the bot in action:
1. Open Telegram and search for `@DenoGrammyStarter_bot`.
2. Start the bot with `/start`.
3. Accept the Terms of Use with `/cgu`.
4. Create and manage a user profile with `/profil`.
5. Admins can use `/info` to view bot statistics.

## Prerequisites
Before setting up the bot, ensure you have:
- A Telegram account.
- A [Deno Deploy](https://deno.com/deploy) account for deployment.
- An [AWS account](https://aws.amazon.com) for S3 storage (for conversation files and Deno KV backups).
- [Git](https://git-scm.com/) installed locally.
- [Deno](https://deno.land/) installed for local development.

## Setup Instructions

### 1. Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/egave/deno-grammy-starter-bot.git
cd deno-grammy-starter-bot
```

### 2. Create a Telegram Bot with BotFather
1. Open Telegram and search for `@BotFather`.
2. Use the `/newbot` command to create a new bot.
3. Follow the prompts to set the bot's name and username.
4. Save the `BOT_TOKEN` provided by BotFather, as it is required for configuration.

### 3. Set Up AWS S3 Buckets
The bot uses AWS S3 for storing conversation files and Deno KV backups:
1. Sign in to the [AWS Management Console](https://aws.amazon.com/console).
2. Create two S3 buckets:
   - One for conversation files (e.g., `conversation-bucket`).
   - One for Deno KV backups (e.g., `backup-bucket`).
3. Note the bucket names and ensure your AWS user has permissions to access them.
4. Generate an AWS Access Key ID and Secret Access Key from the AWS IAM console.

### 4. Configure Environment Variables
Set the required environment variables. You can use a `.env` file (if supported in your setup) or export them in your terminal:

```bash
export BOT_NAME="YourBotName"
export BOT_TOKEN="YourBotTokenFromBotFather"
export BOT_ADMIN="TelegramUserID1,TelegramUserID2"
export AWS_ACCESS_KEY_ID="YourAWSAccessKey"
export AWS_SECRET_ACCESS_KEY="YourAWSSecretKey"
export CONVERSATION_BUCKET="conversation-bucket"
export BACKUP_BUCKET="backup-bucket"
export VERSION="1.0.0"
export VERSION_DATE="2025-07-13"
export BOT_USERNAME="@YourBotUsername"
export DEV_USERNAME="@YourDevUsername"
```

- **BOT_NAME**: The name of your bot (e.g., "MyBot").
- **BOT_TOKEN**: The token provided by BotFather.
- **BOT_ADMIN**: Comma-separated Telegram user IDs for administrators.
- **AWS_ACCESS_KEY_ID** and **AWS_SECRET_ACCESS_KEY**: AWS credentials for S3 access.
- **CONVERSATION_BUCKET**: S3 bucket for conversation files.
- **BACKUP_BUCKET**: S3 bucket for Deno KV backups.
- **VERSION** and **VERSION_DATE**: Bot version and release date.
- **BOT_USERNAME**: The bot's Telegram username.
- **DEV_USERNAME**: The developer's Telegram username.

### 5. Create a Deno Deploy Project
1. Sign in to [Deno Deploy](https://deno.com/deploy).
2. Create a new project and note its name for deployment configuration.

### 6. Update deno.json
Edit the `deno.json` file to update the `deploy` and `deployPROD` tasks:
- Set the `--project` flag to your Deno Deploy project name (e.g., `my-bot-project`).

### 7. Configure the Webhook
Set up a webhook to connect the bot to your Deno Deploy project:
```bash
curl -F "url=https://<your-deno-project>.deno.dev/<your-bot-token>" https://api.telegram.org/bot<your-bot-token>/setWebhook
```
Replace `<your-deno-project>` with your Deno Deploy project name and `<your-bot-token>` with your bot's token.

## Running the Bot Locally
For local development, the bot uses polling mode (via `poll.ts`):
1. Run the bot with:
   ```bash
   deno task run
   ```
2. This starts the bot in polling mode, which is suitable for testing.
   **Note**: Polling mode deletes the webhook. Reconfigure the webhook (step 7) if switching back to Deno Deploy.

## Deploying the Bot to Deno Deploy
You can deploy the bot using one of the following methods:

### Option 1: GitHub Integration
1. Push your code to a GitHub repository.
2. In Deno Deploy, link your repository and select `server.ts` as the entry point.
3. Configure environment variables in the Deno Deploy dashboard to match those in step 4.

### Option 2: Using deployctl
1. Install `deployctl`:
   ```bash
   deno install -A -f --unstable https://deno.land/x/deploy/deployctl.ts
   ```
2. Create an access token in Deno Deploy.
3. Deploy the bot:
   ```bash
   deployctl deploy --project <your-project-name> ./server.ts --prod --token <your-access-token>
   ```
4. Alternatively, use the tasks defined in `deno.json`:
   - `deno task deploy` for non-production deployment.
   - `deno task deployPROD` for production deployment.

## Managing Deno KV Backups
The bot uses Deno KV for persistent storage. To back up the database:
1. Use the `db_dump.ts` script to export data to the `backup-bucket` S3 bucket.
2. Use `db_restore.ts` to restore data from the backup bucket.
3. Configure periodic backup tasks (e.g., via Deno Deploy's cron jobs) to ensure data safety.

## Project Structure
The codebase is organized for modularity and maintainability:
- `src/bot.ts`: Initializes the bot and sets up middleware and composers.
- `src/config.ts`: Manages environment variables and configuration.
- `src/commands/`: Handles bot commands (e.g., `/start`, `/profil`, `/cgu`).
- `src/conversations/`: Manages interactive conversation flows (e.g., CGU acceptance, profile creation).
- `src/middlewares/`: Custom middleware for authentication, maintenance mode, and admin checks.
- `src/db/`: Deno KV database operations and backup/restore scripts.
- `src/service/`: Services for interacting with AWS S3 and Deno KV.
- `src/helpers/`: Utility functions for date handling, statistics, and inline keyboards.
- `src/models/`: TypeScript interfaces for data models (e.g., profiles, CGU).
- `src/ressources/`: Localization files and commune data for France.

## Extending the Bot
To add new features:
1. Create new commands in `src/commands/` or `src/composers/`.
2. Add conversation flows in `src/conversations/`.
3. Update Deno KV models in `src/models/` and services in `src/service/`.
4. Use the provided helpers (e.g., `ctxHelpers.ts`, `inlineKeyboards.ts`) for common tasks.

## Troubleshooting
- **Webhook Issues**: Ensure the webhook URL is correct and accessible. Check logs in Deno Deploy.
- **AWS Errors**: Verify AWS credentials and bucket permissions.
- **Deno KV**: Use `db_reset.ts` to reset the database during development (use with caution).

## Resources
- [GrammyJs Documentation](https://grammy.dev/)
- [Deno Deploy Documentation](https://docs.deno.com/deploy/manual)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/index.html)
- [Deno Documentation](https://deno.land/manual)