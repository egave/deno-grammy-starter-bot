import { InlineKeyboard } from 'npm:grammy'
import { CustomContext } from '../types/customContext.ts'

export default async function handleProfile(ctx: CustomContext) {
    console.log('** command /profil');

    // Le profil n'existe pas encore
    if (!ctx.session.data.profile || !ctx.session.data.profile.baseProfile) {
        // Define inlineKeyboard
        const inlineProfileCreateKeyboard = new InlineKeyboard()
        .text(ctx.t('btn-yes'), "profile-create:yes")
        .text(ctx.t('btn-no'), "profile-create:no");
        
        // Send a message with inlineKeyboard to the Chat asking
        await ctx.reply(ctx.t('profile-create'), {
            reply_markup: inlineProfileCreateKeyboard
        });
    }
    // Le profil existe déjà
    else {
        const addOrEditPhotoKeyboard = "profile-manage:do-photo";
        let addOrEditPhotoButton = "btn-photo-add";
        //Le profil a au moins une photo de profil
        if (ctx.session.data.profile.photos !== undefined && ctx.session.data.profile.photos.length > 0)
            addOrEditPhotoButton = "btn-photo-edit";
            

        // Define inlineKeyboard
        const inlineProfileManageKeyboard = new InlineKeyboard()
        .text(ctx.t('btn-display'), "profile-manage:display")
        .text(ctx.t('btn-edit'), "profile-manage:do-base")
        .text(ctx.t('btn-delete'), "profile-manage:delete").row()
        .text(ctx.t(addOrEditPhotoButton), addOrEditPhotoKeyboard)
        .text(ctx.t('btn-photo-delete'), "profile-manage:delete-photo").row();
        
        // Send a message with inlineKeyboard to the Chat asking
        await ctx.reply(ctx.t('profile-manage'), {
            reply_markup: inlineProfileManageKeyboard,
        });
    }
};