import { CustomContext } from '../../models/customContext.ts'
import { BLOQUED, MEMBER } from '../../config.ts'
import { getUserBotStatusHistory, saveUserBotStatusHistory } from '../../service/dbUserBotStatus.ts';
import { UserBotStatusHistory } from '../../models/userBotStatus.ts'

export default async function handleBotUpdate(ctx: CustomContext) {
    console.debug('** Received "my_chat_member" (bot status update)', ctx.update.my_chat_member);
    
    const userId = ctx.from ? ctx.from.id : null;
    if (!userId) {
        console.error("handleBotUpdate: userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }

    const my_chat_member = ctx.update.my_chat_member ? ctx.update.my_chat_member : null;
    if (!my_chat_member) {
        console.error("handleBotUpdate: my-chat-member is undefined");
        await ctx.reply(ctx.t('my-chat-member-undefined'));
        return;
    }

    let userBotStatusHistory: UserBotStatusHistory | null = await getUserBotStatusHistory(userId);
    if (!userBotStatusHistory) {
        userBotStatusHistory = new UserBotStatusHistory();
    }

    const hasBeenBlocked: boolean = my_chat_member.new_chat_member.status === BLOQUED;
    if (hasBeenBlocked) {
        userBotStatusHistory.addBotStatus(true);
        await saveUserBotStatusHistory(userId, userBotStatusHistory);
        console.warn("⛔ User has blocked Bot: " + my_chat_member.from.id);
        // Send a message to the administrators
        // BOT_ADMIN.forEach(admin => {
        //     ctx.api.sendMessage(admin, "⛔ User has blocked Bot: " + ctx.update.my_chat_member!.from.id);
        // });
        return;
    }

    const wasBlocked: boolean = my_chat_member.old_chat_member.status === BLOQUED;
    const isNewMember: boolean = my_chat_member.new_chat_member.status === MEMBER;
    
    if (wasBlocked && isNewMember){
        userBotStatusHistory.addBotStatus(false);
        await saveUserBotStatusHistory(userId, userBotStatusHistory);
        console.log("❎ User has Unblocked Bot: " + my_chat_member.from.id);
        // Send a message to the administrators
        // BOT_ADMIN.forEach(admin => {
        //     ctx.api.sendMessage(admin, "❎ User has Unblocked Bot: " + ctx.update.my_chat_member!.from.id);
        // });
    }
}