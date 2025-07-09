import { NextFunction } from 'grammyjs';
import { CustomContext } from '../models/customContext.ts';
import type { CGU } from '../models/cgu.ts'
import { getCGU } from '../service/dbCGU.ts';


export const hasSignedCGU =
    <T extends CustomContext>(errorHandler?: (ctx: T) => unknown) =>
        async (ctx: T, next: NextFunction) => {
    console.log('Checking if user has signedUp the terms and conditions');
    console.debug(JSON.stringify(ctx.session, null,2));
    
    const userId = ctx.from ? ctx.from.id : null;

    if (!userId) {
        console.error("handleCGU: userId is undefined");
        return;
    }

    const cgu: CGU | null = await getCGU(userId);
    // If cgu has not been signed 
    if (!cgu || !cgu.hasSignedUp)
    {
        console.log("User did not signed the cgu yet");
        return errorHandler?.(ctx)
    }
    await next();
  }