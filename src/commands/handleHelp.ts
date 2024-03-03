import { CustomContext } from '../types/customContext.ts'

export default async function handleHelp(ctx: CustomContext) {
    console.log('** command /aide');

    await ctx.reply(ctx.t('aide'));
}