import { InlineKeyboard } from 'grammyjs'
import type { CustomContext } from '../types/customContext.ts'

export function inlineCharteKeyboardButtons (ctx: CustomContext): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-accept'), "charter:yes")
    .text(ctx.t('btn-refuse'), "charter:no");

    return inlineKeyboard;
}

export function inlineYesNoKeyboardButtons (ctx: CustomContext): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-yes'), "y")
    .text(ctx.t('btn-no'), "n");

    return inlineKeyboard;
}

export function inlineGenderKeyboardButtons (ctx: CustomContext): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-woman'), "w")
    .text(ctx.t('btn-man'), "m");

    return inlineKeyboard;
};