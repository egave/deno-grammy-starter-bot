import { CustomContext } from '../models/customContext.ts'

export default async function handleHelp(ctx: CustomContext) {
    console.log('** command /aide');

    await ctx.reply(ctx.t('help'), {
        link_preview_options : { is_disabled: true },
        parse_mode: "HTML"
    });
}