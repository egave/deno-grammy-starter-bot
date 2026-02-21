import { Composer } from 'grammyjs'
import type { CustomContext } from '../models/customContext.ts'
import doStat from '../tasks/doStat.ts'
import { globalCommandTranslations } from '../config.ts'
import handleStart from '../commands/handleStart.ts'
import handleHelp from '../commands/handleHelp.ts'
import handleProfile from '../commands/handleProfile.ts'
import handleCGU from '../commands/handleCGU.ts'

const userComposer = new Composer<CustomContext>()

console.debug('Creating user composer...');

userComposer.command(globalCommandTranslations.start, handleStart);

userComposer.command(globalCommandTranslations.help, handleHelp);

userComposer.command(globalCommandTranslations.terms, handleCGU);

userComposer.command(globalCommandTranslations.profile, handleProfile);

userComposer.command(globalCommandTranslations.quit, async ctx => {
    console.log('** command /quitter');
    //await ctx.conversation.exit();
    // conversation are now exited from 'exitConv' middleware
    ctx.session.data.route = 'idle';
    await ctx.reply(ctx.t('quit'));
})

// Runs the doMatch CRON
userComposer.command('dostat', async ctx => {
    console.log('** command /dostat');
    const result: string = await doStat();
    console.log(result);
})

userComposer.on("callback_query:data", (ctx: CustomContext) => {
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

/*
userComposer.on("::bot_command").use(async (ctx:CustomContext) => {
    console.debug(ctx)
    await ctx.reply('Commande non reconnue. Si tu as besoin d\'aide, utilise la commande /aide.')
})
*/

export { userComposer }