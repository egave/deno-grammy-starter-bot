import { CustomContext } from '../models/customContext.ts'

export default async function handleProfile(ctx: CustomContext) {
    console.log('** command /profile');

    // Enter the doProfile conversation
    await ctx.conversation.enter("doProfile");
};