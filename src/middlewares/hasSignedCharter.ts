import { NextFunction } from 'npm:grammy';
import { CustomContext } from '../types/customContext.ts'
import { initSessionData } from '../types/sessionData.ts';
import { isAdmin } from '../helpers/isAdmin.ts';


export const hasSignedCharter =
    <T extends CustomContext>(errorHandler?: (ctx: T) => unknown) =>
    (ctx: T, next: NextFunction) => {
    console.log('Checking if user has signed the Bot Charter');
    console.log(JSON.stringify(ctx.session, null,2));

    // If admin user, skip
    // if (!isAdmin(ctx))
    //     return next();

    // If /start or /charte commands, skip
    if ((ctx.message?.text === '/start' || ctx.message?.text === '/charte'))
        return next();
    
    if (!ctx.session.data)
        ctx.session.data = initSessionData();
        
    // If charter has not been signed 
    if (!ctx.session.data.charter || !ctx.session.data.charter.hasSignedUp)
    {
        console.log("User did not signed the Charter yet");
        return errorHandler?.(ctx)
    }
    return next();
  }