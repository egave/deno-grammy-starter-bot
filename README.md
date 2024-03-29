# Deno GrammY Starter Bot

## Starter template for Telegram Bots with GrammY on Deno Deploy 

This Telegram Bot is a typescript starter template Bot developed under [GrammY Framework](https://grammy.dev/) and deployed on [Deno Deploy](https://docs.deno.com/deploy/manual).
It is free of charge and to clone for your own use (see LICENSE file). 

## Test the bot

1. Open your Telegram application and search for `@DenoGrammyStarter_bot` 
2. Initialize it with `/start`
3. You have to accept the 'Charter' with the `/charte` command to start using it. The only purpose of this 'Charter' is to show the principles of implementing and using a custom middleware (here `hasSignedCharter.ts`)
4. Once 'Charter' is accepted, you can create and manage a simple profile with the `/profil` command.

## Clone 'Deno GrammY Starter Bot'

1. Create a new `<YOUR_DENO_PROJECT>` project on Deno Deploy.
2. Clone the `'Deno GrammY Starter Bot'` template form GitHub :
`git clone https://github.com/egave/deno-grammy-starter-bot.git` 
3. Now you have to customize `deploy` and `deployPROD` tasks in deno.json file and change the `--project` setting to `<YOUR_DENO_PROJECT>`.

4. Create a new Telegram Bot with `@BotFather`.
Give-it the `BOT_NAME` and `BOT_YOURNAME` of your choice.
Keep the `BOT_TOKEN` safe an secret. Do not commit a file with the `BOT_TOKEN` in it.
5. Set-up environment variables
You have to set-up theses environements variables before deploying / running your Bot.
`export BOT_NAME='<YOUR_BOT_NAME>'`
`export BOT_TOKEN="<YOUR_BOT_TOKEN>"`
`export BOT_ADMIN=<COMMA_SEPARATED_LIST_OF_TELEGRAM_USER.ID>`
6. Customize Config variables
You have to customize theses config variables before deploying / running your Bot.
`export const VERSION = "<VERSION>"`
`export const VERSION_DATE = "<VERSION_DATE>"`
`export const BOT_USERNAME = "<YOUR_BOT_USERNAME>";`
`export const DEV_USERNAME = "<YOUR_USERNAME>"`
7. Set your bot’s webhook URL to `https://<YOUR_DENO_PROJECT>.deno.dev/<BOT_TOKEN>` (replacing `<...>` with respective values). To do that, you can open the request URL in your browser:

`https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<YOUR_DENO_PROJECT>.deno.dev/<BOT_TOKEN>`

## Deploying with GitHub (easy)

1. Push your project to a GitHub repository.
2. Set up GitHub Integration in the project’s settings. Select `server.ts` as the entry point.
3. You’re done! New versions will be automatically deployed on push.

## Deploying with deployctl (advanced)

1. Install `deployctl`.
2. Create a new access token. Save it somewhere.
3. Run this command to deploy: 

`deployctl deploy --project <PROJECT_NAME> ./server.ts --prod --token <ACCESS_TOKEN>`
Or
`deno task deploy` if you want to deploy to no-prod
`deno task deployPROD` if you want to deploy to prod

## Running the bot locally

Use `poll.ts` to run the bot locally for development. Note that it will delete the webhook URL, and you’ll need to repeat step n°7 to be able to run the bot on Deno Deploy.

Run this command to deploy and run the bot locally: 
`deno task run`
