import { NextFunction } from 'grammyjs';
import { CustomContext } from '../models/customContext.ts'

// When a new command is issued by the user, this middleware will exit  
// any open conversation before the next middleware is executed.
export const exitConv =
    <T extends CustomContext>(/*errorHandler?: (ctx: T) => unknown*/) => 
        async (ctx: T, next: NextFunction) => {
    console.debug('Exit open conversation if any');
    const stats = await ctx.conversation.active();

    if (Object.keys(stats).length !== 0) {
        for (const key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
            console.debug("Exited '" + key + "' conversation" );
        }
    } else {
        console.debug("No active conversation to exit");
    }

    console.debug("Continue to next middleware");
    await next();
  }