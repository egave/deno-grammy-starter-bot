import { Composer } from 'npm:grammy'
import type { CustomContext } from '../types/customContext.ts'
import doStat from '../tasks/doStat.ts'
import { addDummyData, deleteDummyData } from '../helpers/dummyData.ts'
import { logAllSessionsDataFromDatabase, logSessionDataFromDatabase,
    deleteSessionFromDatabase, deleteKeysFromDatabase,
    migrationSessionDataInDatabase } from '../helpers/dbHelpers.ts'
import { logContext, deleteContext } from '../helpers/ctxHelpers.ts'
import { acceptCharter, refuseCharter } from '../types/charter.ts'
import handleStart from '../commands/handleStart.ts'
import handleCharter from '../commands/handleCharter.ts'
import handleHelp from '../commands/handleHelp.ts'
import handleInfo from '../commands/admin/handleInfo.ts'
import handleProfile from '../commands/handleProfile.ts'
import handleDisplay from '../commands/handleDisplay.ts'
import { displayProfile } from '../commands/handleDisplay.ts'

const composer = new Composer<CustomContext>()

console.debug('Creating composer...');

composer.command('start', handleStart);

composer.command('aide', handleHelp);

composer.command('charte', handleCharter);

composer.command('profil', handleProfile);

composer.command('voir', handleDisplay);

// Commandes réservée aux admins

composer.command('info', handleInfo);

composer.command('logctx',logContext);

composer.command('delctx',deleteContext);

composer.command('mig', async ctx => {
    console.log('** command /migratedata');
    const args = ctx.msg.text.split(' ').slice(1);
    if (args.length < 1) {
        await ctx.reply("Missing arguments [userId: string]");
        return;
    }
    await migrationSessionDataInDatabase(ctx, args[0]);
})


composer.command('ls', async ctx => {
    console.log('** command /listsessions')
    await logAllSessionsDataFromDatabase(ctx);
})

composer.command('sd', async ctx => {
    console.log('** command /sessiondata');
    const args = ctx.msg.text.split(' ').slice(1);
    if (args.length < 1) {
        await ctx.reply("Missing arguments [userId: string]");
        return;
    }
    await logSessionDataFromDatabase(ctx, args[0]);
})

composer.command('ds', async ctx => {
    console.log('** command /delsession')
    const args = ctx.msg.text.split(' ').slice(1);
    
    if (args.length < 1) {
        await ctx.reply("Missing arguments [userId: string]");
        return;
    }
    await deleteSessionFromDatabase(ctx, args[0]);
})

composer.command('delkeys', async ctx => {
    console.log('** command /delkeys')
    const args: (string | number)[] = ctx.msg.text.split(' ').slice(1).map(arg => {
        // Attempt to parse the argument as a number
        const parsedNumber = parseFloat(arg);
        // If parsing is successful and the parsed value is not NaN, return the parsed number
        if (!isNaN(parsedNumber)) {
            return parsedNumber;
        }
        // Otherwise, return the argument as is (still a string)
        return arg;
    });
    console.log('arguments : ', args)
    
    if (args.length < 1) {
        await ctx.reply("Missing arguments [userId: string, dataType? : string]");
        return;
    }
    await deleteKeysFromDatabase(ctx, args);
    
})

composer.command('annuler', async ctx => {
    console.log('** command /annuler');
    await ctx.conversation.exit();
    await ctx.reply(ctx.t('cancel'));
})

composer.command('add', async ctx => {
    console.log('** command /addDummyData');
    await addDummyData();
    await ctx.reply('Dummy data added');
})

composer.command('ddd', async ctx => {
    console.log('** command /deleteDummyData');
    await deleteDummyData();
    await ctx.reply('Dummy data deleted');
})

// Runs the doMatch CRON
composer.command('dostat', async ctx => {
    console.log('** command /dostat');
    const result:string = await doStat();
    console.log(result);
})

composer.on("::bot_command", async (ctx) => {
    console.debug('** other command not found')
    await ctx.api.sendMessage(ctx.from.id, ctx.t('not-found-message'));
})

composer.on("callback_query:data", async (ctx: CustomContext) => {
    console.debug("Inside callback_query:data");
    const action = ctx.callbackQuery.data.split(':')[0];
    const response = ctx.callbackQuery.data.split(':')[1];
    console.debug("Clicked on button: " + action + " " + response);

    switch (action) {
        case "charter":
            // Acceptation de la charte
            if (response === "yes") {
                ctx.session.data.charter = acceptCharter();
                await ctx.reply(ctx.t('charter-accepted'));
            } 
            else {
                ctx.session.data.charter = refuseCharter();
                await ctx.reply(ctx.t('charter-refused'));
            }
            break;
        case "profile-create":
            // Creation du profil
            if (response === "yes") {
                await ctx.conversation.enter("doBaseProfile");
                console.debug(ctx.session);
            } 
            else {
                await ctx.reply(ctx.t('profile-create-no'));
            }
            break;
        case "profile-manage":
            switch (response) {
                case "display": {            
                    // Le profil n'existe pas
                    if (!ctx.session.data.profile || !ctx.session.data.profile.baseProfile) {    console.debug('Le profil n\'existe plus, on renvoie vers la commande /profil');
                        await handleProfile(ctx);
                    }
                    else {
                        console.debug('On affiche le profil');

                        await displayProfile(ctx);
                    }
                    break;
                }
                case "do-base":
                    await ctx.conversation.enter("doBaseProfile");
                    console.debug(ctx.session);
                    break;
                case "delete":
                    await ctx.conversation.enter("deleteProfile");
                    console.debug(ctx.session);
                    break;
                case "do-detail":
                    await ctx.conversation.enter("doDetailProfile");
                    console.debug(ctx.session);
                break;
                case "do-relation":
                    await ctx.conversation.enter("doRelationProfile");
                    console.debug(ctx.session);
                    break;
                case "do-photo":
                    await ctx.conversation.enter("doPhotoProfile");
                    console.debug(ctx.session);
                    break;
                case "delete-photo":
                    await ctx.conversation.enter("deletePhotoProfile");
                    console.debug(ctx.session);
                    break;
            }
            break;
        default:
            console.warn(`Not a recognized action: ${action} ${response}`);
    }
  });


composer.on("::bot_command").use(async (ctx:CustomContext) => {
    console.debug(ctx)
    await ctx.reply('Commande non reconnue. Si tu as besoin d\'aide, utilise la commande /aide.')
})

export { composer }