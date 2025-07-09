import { NextFunction } from 'grammyjs';
import { CustomContext } from '../models/customContext.ts';
import { isAdmin } from '../helpers/isAdmin.ts';

export const onlyAdmin =
    <T extends CustomContext>(errorHandler?: (ctx: T) => unknown) =>
        async (ctx: T, next: NextFunction) => {
    console.log('Middleware(onlyAdmin): Check if user is Admin and can execute command');
    // This middelware checks if the command is executed by one of the Bot's ADMINs user
    // Specifically specified in the BOT_ADMIN array 
    if (!isAdmin(ctx)) {
        console.log(`User (${ctx.from!.id}) is not admin, cannot execute the command`);
        return errorHandler?.(ctx)
    }
    await next();
}