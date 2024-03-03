import { CustomContext } from '../types/customContext.ts'
import { initSessionData } from '../types/sessionData.ts';
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
    console.debug(">>>>> ctx.session.data.charter");
    console.debug(JSON.stringify(ctx.session.data?.charter, null, 2));
    console.debug(">>>>> ctx.session.data.profile");
    console.debug(JSON.stringify(ctx.session.data?.profile, null, 2));
    console.debug(">>>>> ctx.conversation");
    console.debug(JSON.stringify(ctx.conversation, null, 2));

    await ctx.reply(JSON.stringify(ctx.session.data?.charter, null, 2) + '\n' +
    JSON.stringify(ctx.session.data?.profile, null, 2));
};

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
