import { Composer } from 'grammyjs'
import type { CustomContext } from '../models/customContext.ts'
import { KVKeyNames, KEY_AS_NUMBER } from '../config.ts'
import { isAdmin } from '../helpers/isAdmin.ts';
import { addDummyData } from '../helpers/dummyData.ts'
import { showSessions, showSession,
    deleteSession, deleteRecords,
    migrationSession, showRecords } from '../helpers/dbHelpers.ts'
import { logContext, deleteContext } from '../helpers/ctxHelpers.ts'
import handleInfo from '../commands/admin/handleInfo.ts'

const adminComposer = new Composer<CustomContext>()

console.debug('Creating admin composer...');

// Commandes réservée aux admins

adminComposer.command('info', handleInfo);

adminComposer.command('logctx',logContext);

adminComposer.command('delctx',deleteContext);
adminComposer.command('mig', async ctx => {
    console.log('** command /migratedata');
    const args = ctx.msg.text.split(' ').slice(1);
    if (args.length < 1) {
        await ctx.reply("Missing arguments [userId: string]");
        return;
    }
    await migrationSession(ctx, Number(args[0]));
})


adminComposer.command('ls', async ctx => {
    console.log('** command /listsessions')
    await showSessions(ctx);
})

adminComposer.command('kv', async ctx => {
    console.log('** command /keyvalues')
    const args = ctx.msg.text.split(' ').slice(1);
    // if (args.length < 1) {
    //     await ctx.reply("Missing arguments (string | number)[]");
    //     return;
    // }
    // Process arguments: convert numbers to actual numbers
    const processedArgs = args.map(arg => {
        const num = Number(arg);
        return isNaN(num) ? arg : num; // Use number if valid, otherwise keep as string
    });
    await showRecords(ctx, processedArgs);
})

adminComposer.command('lv', async ctx => {
    console.log('** command /listvalues')
    const args = ctx.msg.text.split(' ').slice(1);
    if (args.length < 1) {
        await ctx.reply("Missing arguments (string | number)[]");
        return;
    }
    // Process arguments: convert numbers to actual numbers
    const processedArgs = args.map(arg => {
        const num = Number(arg);
        return isNaN(num) ? arg : num; // Use number if valid, otherwise keep as string
    });
    await showRecords(ctx, processedArgs, true);
})

adminComposer.command('lvs', async ctx => {
    console.log('** command /listvalues')
    const args = ctx.msg.text.split(' ').slice(1);
    if (args.length < 1) {
        await ctx.reply("Missing arguments (string | number)[]");
        return;
    }

    await showRecords(ctx, args, true);
})

adminComposer.command('sd', async ctx => {
    console.log('** command /sessiondata');
    const args = ctx.msg.text.split(' ').slice(1);
    if (args.length < 1) {
        await ctx.reply("Missing arguments [userId: string]");
        return;
    }
    await showSession(ctx, parseInt(args[0]));
})

adminComposer.command('ds', async ctx => {
    console.log('** command /delsession')
    const args = ctx.msg.text.split(' ').slice(1);
    
    if (args.length < 1) {
        await ctx.reply("Missing arguments [userId: string]");
        return;
    }
    await deleteSession(ctx, parseInt(args[0]));
})

adminComposer.command('delkeys', async ctx => {
    console.log('** command /delkeys');

    // Split the text into parts
    const [cmd, ...args] = ctx.msg.text.split(" ");
    console.log('command: ' + cmd +' with args: ',args);

    let processedArgs: (string | number)[] = args;
    if (args.length > 1) {
        const firstArg = args[0] as KVKeyNames; // Type assertion
        if (KEY_AS_NUMBER.includes(firstArg)) {
            processedArgs = args.map(arg => {
                const num = Number(arg);
                return isNaN(num) ? arg : num; // Use number if valid, otherwise keep as string
            });
        }
    }
    /*
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
    */
    console.log('arguments : ', processedArgs)
    
    if (args.length < 1) {
        await ctx.reply("Missing arguments [userId: string, dataType? : string]");
        return;
    }
    const nbDeleted: number = await deleteRecords(processedArgs);
    await ctx.reply("Deleted " + nbDeleted + " objects for " + processedArgs + " key",
        { parse_mode: "HTML" });
})

/*
composer.command(commandTranslations.quit, async ctx => {
    console.log('** command /quitter');
    //await ctx.conversation.exit();
    // conversation are now exited from 'exitConv' middleware
    ctx.session.data.route = 'idle';
    await ctx.reply(ctx.t('quit'));
})
*/

adminComposer.command('add', async ctx => {
    console.log('** command /addDummyData');
    await addDummyData();
    await ctx.reply('Dummy data added');
})

adminComposer.on("::bot_command", async (ctx) => {

    if (!ctx.msg || !ctx.msg.text) {
        console.error("received a command: msg.text is undefined");
        await ctx.reply(ctx.t('not-found-message'));
        return;
    }

    // Split the text into parts
    const [cmd, ...args] = ctx.msg.text.split("_");
    console.log('command: ' + cmd +' with args: ',args);

    switch (cmd) {
        case '/kv': {
            if (!isAdmin(ctx)) {
                    console.log(`User (${ctx.from!.id}) is not admin, cannot execute the command`);
                    return;
            }
            let processedArgs: (string | number)[] = args;
            if (args.length > 1) {
                if (KEY_AS_NUMBER.includes(args[0])) {
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
            console.debug('*** other command not found')
            await ctx.reply(ctx.t('not-found-command'));
            break;
    }
})

adminComposer.on("::bot_command").use(async (ctx:CustomContext) => {
    console.debug(ctx)
    await ctx.reply('Commande non reconnue. Si tu as besoin d\'aide, utilise la commande /aide.')
})

export { adminComposer }