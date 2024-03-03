import type { CustomContext } from '../../types/customContext.ts'
import type { User } from "types-manage"
import { VERSION, VERSION_DATE } from '../../config.ts'
import { isAdmin } from '../../helpers/isAdmin.ts';

                            
export default async function handleInfo(ctx: CustomContext) {
    console.log('** command /info');

    // This command is only available to ADMINs of the BOT
    // Specifically specified in the BOT_ADMIN array 
    if (!isAdmin(ctx)) {
        await ctx.reply(ctx.t('cmd_only_admin_error'));
        return;
    }

    if (ctx.from)
    {
        const user: User = ctx.from!;
        await ctx.reply(ctx.t('info', {
            "version": VERSION,
            "version-date": VERSION_DATE,
            "user-id": user.id,
            "is-bot": String(user.is_bot),
            "username": user.username?user.username:'inconnu',
            "first-name": user.first_name,
            "last-name": user.last_name?user.last_name:'inconnu',
            "language-code": user.language_code?user.language_code:'inconnu',
            "chat-id": ctx.chat?ctx.chat.id:'inconnu',
            "chat-type": ctx.chat?ctx.chat.type:'inconnu'
        }));
    }
    else {
        await ctx.reply(ctx.t('info-light', {
            "version": VERSION,
            "version-date": VERSION_DATE,
            "chat-id": ctx.chat?ctx.chat.id:'inconnu',
            "chat-type": ctx.chat?ctx.chat.type:'inconnu'
        }));
    }
}