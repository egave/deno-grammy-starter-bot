import { Bot, session, MaybePromise, GrammyError, HttpError } from 'grammyjs';
import { apiThrottler } from 'grammyThrottler';
import path from 'node:path';
import { DenoKVAdapter } from "denokv";
import {
  conversations,
  createConversation,
} from "grammyConversations";
import { I18n } from "i18n";
import kv from './db/db.ts' 
import { initSessionData } from './types/sessionData.ts';
import type { CustomContext } from './types/customContext.ts'
import { hasSignedCharter } from './middlewares/hasSignedCharter.ts';
import { composer } from './composers/index.ts'
import { doBaseProfile, deleteProfile,
          doPhotoProfile, deletePhotoProfile } from './conversations/profileConversation.ts'

const __dirname = path.resolve();

function getSessionKey(ctx: Omit<CustomContext, 'session'>): MaybePromise<string | undefined> {
  // Give every user their personal session storage
  // (will be shared across groups and in their private chat)
  return ctx.from?.id.toString();
}

// 1. Create a bot with a token
console.debug('Creating bot...');
export const bot = new Bot<CustomContext>(Deno.env.get("BOT_TOKEN") || '')

// 2. Attach I18n plugin for internalization
// Create an `I18n` instance.
export const i18n = new I18n<CustomContext>({
  defaultLocale: "fr", // see below for more information
});

// Translation files loaded this way works in Deno Deploy, too.
await i18n.loadLocalesDir(`${__dirname}/src/ressources/locales`);

// Register the i18n instance in the bot,
// so the messages get translated on their way!
console.debug('Attaching I18n...');
bot.use(i18n);

// 3. Attach an api throttler transformer to the bot
console.debug('Attaching api throttlet...');
bot.api.config.use(apiThrottler())

// 4. Attach a multi-session middleware and specify
// the initial data and for the conversation
console.debug('Attaching session...');
bot.use(
  session({
    type: "multi",
    data :
    {
      initial: initSessionData,
      getSessionKey,
      storage: new DenoKVAdapter(kv)
    },
    conversation: {},
  })
)

// 5. Attach custom middleware to check if user has signed Charter
// We filter on 'bot_command' entities with '.on("message:entities:bot_command")'
// to only execute 'hasSignedCharter' middleware on bot_commands
// and to let pass the other messages as the CallBack queries.
console.debug('Attaching hasSignedCharter...');
bot.on("message:entities:bot_command").use(
  hasSignedCharter(ctx => ctx.reply(ctx.t('need-sign-charter')))
);

// 6. Attach all conversations to the bot as middleware
console.debug('Attaching conversations...');
bot.use(conversations());
//bot.use(createConversation(doProfile));
bot.use(createConversation(doBaseProfile, { maxMillisecondsToWait: 600000}));
bot.use(createConversation(doPhotoProfile, { maxMillisecondsToWait: 600000}));
bot.use(createConversation(deletePhotoProfile));
bot.use(createConversation(deleteProfile));

// 7. Attach all composers to the bot as middleware
console.debug('Attaching composers...');
bot.use(composer)

//CRASH HANDLER
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(
      `[bot-catch][Error while handling update ${ctx.update.update_id}]`,
      { metadata: err.error }
  );
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
          metadata: e.message,
          stack: e.stack,
      });
  } else if (e instanceof HttpError) {
      console.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
          metadata: e.error,
          stack: e.stack,
      });
  } else {
      console.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
          metadata: e,
      });
  }
});
// 6. Start the bot
//bot.start()
