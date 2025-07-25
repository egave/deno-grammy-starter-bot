import { CustomContext } from '../models/customContext.ts'
import { initSessionData } from '../models/sessionData.ts';
import { isAdmin } from '../helpers/isAdmin.ts';

 export async function logContext(ctx: CustomContext) {
    console.debug("** command /logctx");

    // This command is only available to ADMINs of the BOT
    // Specifically specified in the BOT_ADMIN array 
    if (!isAdmin(ctx)) {
        await ctx.reply(ctx.t('cmd_only_admin_error'));
        return;
    }

    console.debug(">>>>> ctx.session");
    console.debug(JSON.stringify(ctx.session, null, 2));
    console.debug(">>>>> ctx.session.data");
    console.debug(JSON.stringify(ctx.session["data"], null, 2));
    console.debug(">>>>> ctx.conversation");
    console.debug(JSON.stringify(ctx.conversation, null, 2));

    if (ctx.session)
        await ctx.reply(JSON.stringify(ctx.session, null, 2));
    else
        await ctx.reply("Pas de session enregistrée");
}

export async function deleteContext(ctx: CustomContext) {
    console.debug("** command /delctx");

    // This command is only available to ADMINs of the BOT
    // Specifically specified in the BOT_ADMIN array 
    if (!isAdmin(ctx)) {
        await ctx.reply(ctx.t('cmd_only_admin_error'));
        return;
    }

    ctx.session.data = initSessionData();
    
    await ctx.reply(ctx.t('context-init'));
    await logContext(ctx);
};
