import type { CustomContext, MyConversation } from '../../models/customContext.ts'
import { DEFAULTS, commandTranslations } from '../../config.ts'
/**
 * Handles invalid user input by sending an error message and deleting both the error message and the user's message after a delay.
 * 
 * @param ctx - The custom context object containing information about the current interaction.
 * @returns A promise that resolves when the operation is complete.
 */
export async function handleInvalidUserInput(ctx: CustomContext): Promise<void> {
    if (ctx.message && !ctx.message?.text?.startsWith('/')) {
        const useButtonsMessage = await ctx.reply(ctx.t('use-buttons-error', 
                            {"delay": DEFAULTS.CONFIG.MESSAGE_DELETE_DELAY/1000}),
                                                { parse_mode: "HTML" });
        // Delete the messages after a delay
        setTimeout(async () => {
            try {
                // Delete the error message
                await ctx.api.deleteMessage(ctx.chat!.id, useButtonsMessage.message_id);
                // Delete the user's message
                await ctx.api.deleteMessage(ctx.chat!.id, ctx.message!.message_id);
            } catch (error) {
                console.error("Error deleting messages:", error);
            }
        }, DEFAULTS.CONFIG.MESSAGE_DELETE_DELAY); // in milliseconds
    }
}

// Helper function for invalid input handling
export async function handleInvalidIntInput(ctx: CustomContext, validCmds: {cancel: boolean, back: boolean} = {cancel: false, back: false}): Promise<void> {
    if (ctx.message?.text?.startsWith('/')) {
        const cmd = ctx.message.text.replace(/^\//, '').trim();
        const chat_id = ctx.from?.id;
        if (validCmds.cancel && commandTranslations['cancel'].includes(cmd)) {
            // Delete the user's message
            await ctx.api.deleteMessage(chat_id!, ctx.message!.message_id);
            throw new Error("USER_CANCEL"); // Signal to exit with cancel effect
        }
        if (validCmds.back && commandTranslations['back'].includes(cmd)) {
            throw new Error("USER_BACK"); // Signal to exit with back effect
        }
        if (commandTranslations['quit'].includes(cmd)) {
            throw new Error("USER_QUIT"); // Signal to exit
        }
    }
    await ctx.reply(ctx.t('expected-number-error'));
}
// Helper function for invalid input handling
export async function handleInvalidWaitInput(ctx: CustomContext, validCmds: {cancel: boolean, back: boolean} = {cancel: false, back: false}) {
    if (ctx.message?.text?.startsWith('/')) {
        const cmd = ctx.message.text.replace(/^\//, '').trim();
        const chat_id = ctx.from?.id;
        if (validCmds.cancel && commandTranslations['cancel'].includes(cmd)) {
            // Delete the user's message
            await ctx.api.deleteMessage(chat_id!, ctx.message!.message_id);
            throw new Error("USER_CANCEL"); // Signal to exit with cancel effect
        }
        if (validCmds.back && commandTranslations['back'].includes(cmd)) {
            throw new Error("USER_BACK"); // Signal to exit with back effect
        }
        if (commandTranslations['quit'].includes(cmd)) {
            throw new Error("USER_QUIT"); // Signal to exit with quit effect
        }
    }
    await ctx.reply(ctx.t('use-buttons-error-no-delay'));
    throw new Error("USER_OTHER_ERROR");
}

export function cleanInput(input: string): string {
    return input
        .normalize("NFKC")  // Normalize Unicode to a standard form
        .replace(/\p{Cf}/gu, "") // Remove invisible Unicode control characters
        .trim(); // Trim leading and trailing spaces
}

export async function handleQuit(conv: MyConversation, ctx: CustomContext) {
    await ctx.reply(ctx.t('quit'));
    await conv.halt();
    return;
}