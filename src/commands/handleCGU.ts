import { CustomContext } from '../models/customContext.ts'

export default async function handleCGU(ctx: CustomContext) {
    console.log('** command /terms');

    const userId = ctx.from ? ctx.from.id : null;

    if (!userId) {
        console.error("handleCGU: userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }

    try {
        await ctx.conversation.enter("doCGU");
    }
    catch (error) {
        console.error('Error in handleCGU:', error);
    }
}