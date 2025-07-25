import { Composer } from 'grammyjs'
import type { CustomContext } from '../models/customContext.ts'
import doStat from '../tasks/doStat.ts'
import { commandTranslations } from '../config.ts'
import handleStart from '../commands/handleStart.ts'
import handleHelp from '../commands/handleHelp.ts'
import handleProfile from '../commands/handleProfile.ts'
import handleStatusUpdate from './events/handleStatusUpdate.ts'
import handleCGU from '../commands/handleCGU.ts'

const composer = new Composer<CustomContext>()

console.debug('Creating composer...');

composer.command('start', handleStart);

composer.command('aide', handleHelp);

composer.command('cgu', handleCGU);

composer.command('profil', handleProfile);

composer.command('annuler', async ctx => {
    console.log('** command /annuler');
    ctx.session.data.route = 'idle';
    await ctx.reply(ctx.t('cancel'));
})

composer.command(commandTranslations.quit, async ctx => {
    console.log('** command /quitter');
    //await ctx.conversation.exit();
    // conversation are now exited from 'exitConv' middleware
    ctx.session.data.route = 'idle';
    await ctx.reply(ctx.t('quit'));
})

// Runs the doMatch CRON
composer.command('dostat', async ctx => {
    console.log('** command /dostat');
    const result:string = await doStat();
    console.log(result);
})

// Manage status updates about your bot (to deal with 'kicked' updates)
composer.on("my_chat_member", handleStatusUpdate)

composer.on("::bot_command", async (ctx) => {
    console.debug('** other command not found')
    await ctx.reply(ctx.t('not-found-message'));
})

composer.on("callback_query:data", (ctx: CustomContext) => {
    console.debug("Inside callback_query:data");
    if (!ctx.callbackQuery || !ctx.callbackQuery.data) return;
    
    const action = ctx.callbackQuery.data.split(':')[0];
    const response = ctx.callbackQuery.data.split(':')[1];
    console.debug("Clicked on button: " + action + " " + response);

    switch (action) {
        default:
            console.warn(`Not a recognized action: ${action} ${response}`);
    }
  });


composer.on("::bot_command").use(async (ctx:CustomContext) => {
    console.debug(ctx)
    await ctx.reply('Commande non reconnue. Si tu as besoin d\'aide, utilise la commande /aide.')
})

export { composer }