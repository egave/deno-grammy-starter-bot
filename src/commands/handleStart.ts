import { CustomContext } from '../models/customContext.ts'
import type { CGU } from '../models/cgu.ts'
import { getCGU } from '../service/dbCGU.ts'

export default async function handleStart(ctx: CustomContext) {
    console.log('** command /start');
    
    const userId = ctx.from ? ctx.from.id : null;

    if (!userId) {
        console.error("handleStart: userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }

    let hasSignedUp: boolean = false;
    const cgu: CGU | null = await getCGU(userId);
    // If cgu has not been signed 
    if (cgu && cgu.hasSignedUp)
    {
        hasSignedUp = true;
    } else {
        console.log("User did not signed the cgu yet");
    }

    await ctx.reply(ctx.t('start', {
        hasSignedUp: hasSignedUp ? 1 : 0,
        name: ctx.from?ctx.from.first_name:'inconnu',
    }));
}