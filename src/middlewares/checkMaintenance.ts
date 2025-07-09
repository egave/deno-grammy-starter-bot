import { NextFunction } from 'grammyjs';
import { CustomContext } from '../models/customContext.ts';

export const checkMaintenance =
    <T extends CustomContext>(errorHandler?: (ctx: T) => unknown) =>
        async (ctx: T, next: NextFunction) => {
    console.debug('Middleware(checkMaintenance): Check if Lib\'Auto is in maintenance mode');
    // This middelware checks if the the maintenance mode is enabled
    // and block the user from executing any command in this case
    if (Deno.env.get("MAINTENANCE") && Deno.env.get("MAINTENANCE") === "ON") {
        return errorHandler?.(ctx)
    }
    await next();
}