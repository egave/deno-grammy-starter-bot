import { CustomContext } from '../../types/customContext.ts'
import { BLOQUED, MEMBER } from '../../config.ts'
//import { BOT_ADMIN } from '../../helpers/isAdmin.ts'

export default function handleBotUpdate(ctx: CustomContext) {
    console.debug('** Received "my_chat_member" (bot status update)');

    if (ctx.update.my_chat_member) {
        const hasBeenBlocked: boolean = ctx.update.my_chat_member.new_chat_member.status === BLOQUED;
        if (hasBeenBlocked) {
            ctx.session.data.hasBeenBlocked = true;
            console.warn("⛔ User has blocked Bot: " + ctx.update.my_chat_member.from.id);
            // Send a message to the administrators
            // BOT_ADMIN.forEach(admin => {
            //     ctx.api.sendMessage(admin, "⛔ User has blocked Bot: " + ctx.update.my_chat_member!.from.id);
            // });
            return;
        }

        const wasBlocked: boolean = ctx.update.my_chat_member.old_chat_member.status === BLOQUED;
        const isNewMember: boolean = ctx.update.my_chat_member.new_chat_member.status === MEMBER;
        
        if (wasBlocked && isNewMember){
            ctx.session.data.hasBeenBlocked = false;
            console.log("❎ User has Unblocked Bot: " + ctx.update.my_chat_member.from.id);
            // Send a message to the administrators
            // BOT_ADMIN.forEach(admin => {
            //     ctx.api.sendMessage(admin, "❎ User has Unblocked Bot: " + ctx.update.my_chat_member!.from.id);
            // });
        }
    }
}