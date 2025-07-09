// https://stackoverflow.com/questions/76937418/conversation-touchs-other-sessions-in-grammy

import type { CustomContext, MyConversation } from '../models/customContext.ts'
import { DEFAULTS } from '../config.ts'
import { getCGU, insertCGU, updateCGU } from '../service/dbCGU.ts'
import { acceptCGU, refuseCGU } from '../models/cgu.ts'
import { inlineReplayCGUKeyboardButtons,inlineCGUKeyboardButtons } from '../helpers/inlineKeyboards.ts'
import { localeOptions_ymd } from '../helpers/dateHelpers.ts'
import { handleInvalidUserInput } from './utils/convUtils.ts'

/** Defines "doCGU" conversation */
export async function doCGU(conversation: MyConversation, ctx: CustomContext) {
    await conversation.log("Inside doCGU conversation");

    const userId = ctx.from ? ctx.from.id : null;

    if (!userId) {
        await conversation.error("handleCGU: userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }

    const cgu = await getCGU(userId);
    const hasSignedUp = cgu && cgu.hasSignedUp || false;
    const hasRefused = cgu && !cgu.hasSignedUp || false;

    if (cgu && (hasSignedUp || hasRefused)) {
        const replayText = hasSignedUp ? 'cgu-already-accepted': 'cgu-already-refused';
        const inlineKeyboard = inlineReplayCGUKeyboardButtons(ctx);
        await ctx.reply(ctx.t(replayText,
                    { date : cgu.signatureDate!.toLocaleString(await ctx.i18n.getLocale(), localeOptions_ymd) }),
                { reply_markup: inlineKeyboard,
                parse_mode: "HTML" });
        // Listen for user responses via callback data
        const response = await conversation.waitForCallbackQuery(["y"], {
            otherwise: async (ctx: CustomContext) => {
                await handleInvalidUserInput(ctx);
            }
        });
        // Pas la peine de traiter les réponses car un seul bouton est géré
    }

    await displayCGU(conversation, ctx, userId, hasSignedUp, hasRefused, DEFAULTS.CGU.NUMBER_TEXTS);


    await conversation.log("Quit doCGU conversation");
    await conversation.halt();
}

async function displayCGU(
    conversation: MyConversation, 
    ctx: CustomContext,
    userId: number,  // id du user
    hasSignedUp: boolean,
    hasRefused: boolean,
    numberTexts: number) : Promise<void> {

    let index: number = 0;  // Initial index for CGU

    // Fonction pour mettre à jour le message avec les informations actuelles du trajet
    const updateCGUMessage = async () => {
        ({ inlineKeyboard, cguValues } = inlineCGUKeyboardButtons(ctx, index, numberTexts, !hasSignedUp));
        await conversation.log("displayCGU - Page ", index);
        await ctx.editMessageText(ctx.t("cgu-text-"+index), {
                reply_markup: inlineKeyboard,
                link_preview_options : { is_disabled: true },
                parse_mode: "HTML",
                chat_id: ctx.from?.id,
                message_id: message.message_id
            }
        );
    };

    let { inlineKeyboard, cguValues } = inlineCGUKeyboardButtons(ctx, index, numberTexts, !hasSignedUp);
    
    await conversation.log("displayCGU - Page ", index);
    // Send the first message displaying cgu text
    const message = await ctx.reply(ctx.t("cgu-text-"+index), {
            reply_markup: inlineKeyboard,
            link_preview_options : { is_disabled: true },
            parse_mode: "HTML"
    });

    while (true) {
        await conversation.log("cguValues : ", cguValues);
        // Listen for user responses via callback data
        const response = await conversation.waitForCallbackQuery(cguValues, {
            otherwise: async (ctx: CustomContext) => {
                await handleInvalidUserInput(ctx);
            }
        });

        const action = response.callbackQuery.data;
        await conversation.log("response.callbackQuery.data: ", action);

        // Handle pagination
        if (action.match(/previous/i)) {
            index -= 1;
            await updateCGUMessage();
        } else if (action.match(/next/i)) {
            index += 1;
            await updateCGUMessage();
        } else if (action.match(/accept/i)) {
            if (hasRefused) {
                await updateCGU(userId, acceptCGU());
            } else {
                await insertCGU(userId, acceptCGU());
            }
            await ctx.reply(ctx.t('cgu-accepted'),
            { parse_mode: "HTML" });
            return;
        } else if (action.match(/refuse/i)) {
            if (hasRefused) {
                await updateCGU(userId, refuseCGU());
            } else {
                await insertCGU(userId, refuseCGU());
            }
            await ctx.reply(ctx.t('cgu-refused'),
            { parse_mode: "HTML" });
            return;
        } else if (action.match(/quit/i)) {
            await ctx.reply(ctx.t('cgu-quit'),
            { parse_mode: "HTML" });
            return;
        }
    }
}