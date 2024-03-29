import { CustomContext } from '../types/customContext.ts'

export default async function handleStart(ctx: CustomContext) {
    console.log('** command /start');

    await ctx.reply(ctx.t('start', {
        hasSignedUp: ctx.session.data.charter?ctx.session.data.charter.hasSignedUp?1:0:0,
        name: ctx.from?ctx.from.first_name:'inconnu',
    }));
}