import { CustomContext } from '../types/customContext.ts'
import { inlineCharteKeyboardButtons } from '../helpers/inlineKeyboards.ts'

export default async function handleCharter(ctx: CustomContext) {
    console.log('** command /charte');
    
    // Send a message with inlineCharteKeyboardButtons to the Chat asking
    // for acceptance of the Charte
    await ctx.reply(ctx.t('charter-text'), {
        reply_markup: inlineCharteKeyboardButtons(ctx)
    });

}