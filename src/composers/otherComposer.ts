import { Composer, NextFunction } from 'grammyjs'
import type { CustomContext } from '../models/customContext.ts'
import { isAdmin } from '../helpers/isAdmin.ts';
import { KVKeyNames, KEY_AS_NUMBER } from '../config.ts'
import handleBotUpdate from './events/handleBotUpdate.ts'
import { showRecords } from '../helpers/dbHelpers.ts'

const otherComposer = new Composer<CustomContext>()

console.debug('Creating error composer...');

// Manage status updates about your bot (to deal with 'kicked' updates)
otherComposer.on("my_chat_member", handleBotUpdate);

otherComposer.on("::bot_command", async (ctx: CustomContext, next: NextFunction) => {

    if (!ctx.msg || !ctx.msg.text) {
        console.error("received a command: msg.text is undefined");
        await ctx.reply(ctx.t('not-found-message'));
        return;
    }

    // Split the text into parts
    const [cmd, ...args] = ctx.msg.text.split("_");
    console.log('command: ' + cmd + ' with args: ', args);

    switch (cmd) {
        case '/kv': {
            if (!isAdmin(ctx)) {
                console.warn(`User (${ctx.from!.id}) is not admin, cannot execute the command`);
                await ctx.reply(ctx.t('not-found-command'));
                return;
            }
            let processedArgs: (string | number)[] = args;
            if (args.length > 1) {
                if (KEY_AS_NUMBER.includes(args[0] as KVKeyNames)) {
                    processedArgs = args.map(arg => {
                        const num = Number(arg);
                        return isNaN(num) ? arg : num; // Use number if valid, otherwise keep as string
                    });
                }
            }
            await showRecords(ctx, processedArgs);
        }
            break;
        default:
            await next();
            break;
    }
});

otherComposer.on("::bot_command").use(async (ctx: CustomContext) => {
    console.debug('*** other command not found');
    await ctx.reply(ctx.t('not-found-command'));
})

export { otherComposer }