import { Bot, session, MaybePromise, StorageAdapter, GrammyError, HttpError } from 'grammyjs';
import { apiThrottler } from 'grammyThrottler';
import { limit } from "rate-limiter"
import { S3Adapter } from './service/s3Storage.ts';

import path from 'node:path';
import { DenoKVAdapter } from "denokv";
import {
  conversations,
  createConversation,
} from "grammyConversations";
import { I18n } from "i18n";
import kv from './db/db.ts';
import { DEFAULTS, commandTranslations, adminCommands } from './config.ts';
import { initSessionData } from './models/sessionData.ts';
import type { CustomContext } from './models/customContext.ts'
import { hasSignedCGU } from './middlewares/hasSignedCGU.ts';
import { onlyAdmin } from './middlewares/onlyAdmin.ts';
import { checkMaintenance } from './middlewares/checkMaintenance.ts';
import { exitConv } from './middlewares/exitConv.ts';
import { adminComposer } from './composers/adminComposer.ts'
import { composer } from './composers/index.ts'
import { doCGU } from './conversations/cguConversation.ts'
import { doProfile } from './conversations/profileConversation.ts'

const __dirname = path.resolve();

function getSessionKey(ctx: Omit<CustomContext, 'session'>): MaybePromise<string | undefined> {
  // Give every user their personal session storage
  // (will be shared across groups and in their private chat)
  return ctx.from?.id.toString();
}

// Fonction pour tenter de créer l'adaptateur S3 ou retourner undefined (repli sur mémoire par défaut)
async function getStorageAdapter<T>(): Promise<StorageAdapter<T> | undefined> {
  try {
      const bucketName = Deno.env.get("AWS_CONV_BUCKET_NAME");
      if (!bucketName) {
          throw new Error("AWS_CONV_BUCKET_NAME is not defined in environment variables");
      }
      return await S3Adapter.create<T>(bucketName); // Await the async creation
  } catch (error) {
      console.warn(`Failed to initialize S3Adapter: ${error.message}. Falling back to default in-memory storage.`);
      return undefined; // Retourne undefined pour utiliser le stockage par défaut de Grammy
  }
}

// 1. Create a bot with a token
console.debug('Creating bot...');
export const bot = new Bot<CustomContext>(Deno.env.get("BOT_TOKEN") || '')

// 2. Attach rate limiter plugin for rate limiting
console.debug('Attaching rate limiter...');
bot.use(limit({
  timeFrame: 2000,
  limit: 3,
  // "MEMORY_STORAGE" is the default mode. Therefore if you want to use Redis, do not pass storageClient at all.
  storageClient: "MEMORY_STORE",
  onLimitExceeded: async (ctx: CustomContext) => { 
      await ctx.reply(ctx.t("rate-limit-reached")) 
  },
  // Note that the key should be a number in string format such as "123456789"
  keyGenerator: (ctx: CustomContext) => { return ctx.from?.id.toString() }
}));

// 3. Attach I18n plugin for internalization
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

// 4. Attach an api throttler transformer to the bot
console.debug('Attaching api throttlet...');
// @ts-ignore - Ignore temporairement l'erreur de typage
bot.api.config.use(apiThrottler());

// 5. Attach a multi-session middleware and specify
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
    }
  })
)

// 6. Attach custom middlewares to check if user has signed cgu
// We filter on 'bot_command' entities with '.on("message:entities:bot_command")'
// to only execute 'hasSignedCGU' middleware on bot_commands
// and to let pass the other messages as the CallBack queries.
console.debug('Attaching onlyAdmin middleware...');
bot.on("message:entities:bot_command").command(adminCommands).use(
  onlyAdmin(ctx => ctx.reply(ctx.t('cmd_only_admin_error')))
);

console.debug('Attaching underMaintenance middleware...');
bot.on("message:entities:bot_command").command(Object.values(commandTranslations).flat()).use(
  checkMaintenance(ctx => ctx.reply(ctx.t('under_maintenance')))
);

// 5. Attach custom middleware to check if user has signed CGU
// We filter on 'bot_command' entities with '.on("message:entities:bot_command")'
// to only execute 'hasSignedCGU' middleware on bot_commands
// and to let pass the other messages as the CallBack queries.
console.debug('Attaching hasSignedCGU middleware...');
bot.on("message:entities:bot_command").command([...commandTranslations.profile]).use(
  hasSignedCGU(ctx => ctx.reply(ctx.t('need-sign-cgu'),
                              { parse_mode: "HTML" }))
);

// 6. Attach all conversations to the bot as middleware
console.debug('Attaching conversations...');
bot.use(conversations({
    // UNFORTUNATELY DO NOT WORK under deno deploy -> we got a PermissionDenied: Requires write access to /src/libauto-conv-data, which cannot be granted in this environment
    //storage: new FileAdapter({ dirName: "libauto-conv-data" }),
    // So we use a custom S3 adapter
    storage: await getStorageAdapter().catch(() => undefined), // Handle async failure
    plugins: [i18n],
    onEnter(id, ctx) {
      // Entered conversation `id`.
      console.debug(`Conversation ${id} entered by ${ctx.from?.id}`);
    },
    onExit(id, ctx) {
      // Exited conversation `id`.
      console.debug(`Conversation ${id} exited by ${ctx.from?.id}`);
    },
}));

bot.use(createConversation(doCGU, DEFAULTS.CONFIG.CONVERSATION.COMMON_OPTIONS));
bot.use(createConversation(doProfile, DEFAULTS.CONFIG.CONVERSATION.COMMON_OPTIONS));

// 8. Attach custom middleware to quit any conversation if it is a known command
console.debug('Attaching exitConv...');
bot.on("message:entities:bot_command").use(
  exitConv(/*ctx => ctx.reply(ctx.t('error-exiting-conversation'),
            { parse_mode: "HTML" })*/)
);


// 9. Attach all composers to the bot as middleware
console.debug('Attaching composers...');
bot.use(adminComposer);
bot.use(composer);

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
