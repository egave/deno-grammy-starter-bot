// https://stackoverflow.com/questions/76937418/conversation-touchs-other-sessions-in-grammy

import { Context } from 'npm:grammy'
import { type Conversation } from "npm:@grammyjs/conversations";
import type { CustomContext } from '../types/customContext.ts'
import { Gender } from '../types/profile.ts'
import type { BaseProfile, Photo } from '../types/profile.ts'
import { Profile, createInitialProfile } from '../types/profile.ts'

import { inlineGenderKeyboardButtons, 
        inlineYesNoKeyboardButtons } from '../helpers/inlineKeyboards.ts'

type baseProfileConversation = Conversation<Context>;
type photoProfileConversation = Conversation<Context>;
type deletePhotoProfileConversation = Conversation<Context>;
type deleteProfileConversation = Conversation<Context>;

/** Defines "creerProfile" conversation */
export async function doBaseProfile(conversation: baseProfileConversation, ctx: CustomContext) {
    console.log("Inside createProfile conversation");

    console.debug("Id: " + ctx.from!.id!);
    
    // Demande à l'utilisateur son gender.
    await ctx.reply(ctx.t('profile-create-step1'), {
        reply_markup: inlineGenderKeyboardButtons(ctx),
    });

    // Attend la réponse de l'utilisateur.
    const resGender = await conversation.waitForCallbackQuery(["w", "m"],{
        otherwise: async (ctx: CustomContext) => {
            if (ctx.message?.text !== '/annuler')
                await ctx.reply(ctx.t('profile-use-buttons-error'), { reply_markup: inlineGenderKeyboardButtons(ctx) })
        }
    });
    const gender: Gender = resGender.callbackQuery.data.match(/w/i)? Gender.Woman : Gender.Man;
    console.debug ("genre: ", gender);

    // Demande à l'utilisateur son âge.
    await ctx.reply(ctx.t('profile-create-step2', { gender: gender }));
    
    let age = 0;
    do {
        // Attend la réponse de l'utilisateur.
        age = await conversation.form.int({
            otherwise:  async (ctx: CustomContext) => {
                if (ctx.message?.text !== '/annuler')
                    await ctx.reply(ctx.t('profile-expected-number-error'));
                }
        });
        if (age < 18)
            await ctx.reply(ctx.t('profile-age-minor-error'));
        else if (age > 99)
            await ctx.reply(ctx.t('profile-age-senior-error', { age: age }));
        
        console.debug ("age: " + age);
     } while (age < 18 || age > 99);

    // Demande à l'utilisateur son lieu de résidence.
    await ctx.reply(ctx.t('profile-create-step3', { gender: gender }));

    // Attend la réponse de l'utilisateur.
    const postal_code = await conversation.form.int({
        otherwise:  async (ctx: CustomContext) => {
            if (ctx.message?.text !== '/annuler')
                await ctx.reply(ctx.t('profile-expected-number-error'));
        }
    });
    console.debug ("code_postal: " + postal_code);

    // Demande à l'utilisateur sa bio.
    await ctx.reply(ctx.t('profile-create-step4'));

    // Attend la réponse de l'utilisateur.
    const bio: string = await conversation.form.text();

    const userId = ctx.from?ctx.from.id:'undefined';
    if (!userId) {
        console.debug("userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }
    console.debug ("userId: " + userId);

    const baseProfile: BaseProfile = { gender: gender, 
                                    age: age, 
                                    postal_code: postal_code, 
                                    bio: bio, 
                                    userId: ctx.from!.id, 
                                    username: ctx.from?.username, 
                                    firstName: ctx.from?.first_name, 
                                    lastName: ctx.from?.last_name };
    const profile: Profile = new Profile(new Date(), baseProfile);

    // Le profil existe déjà, on ne modifie que la baseProfile.
    if (conversation.session.data.profile) {
        conversation.log("Profile exists, just change baseProfile")
        conversation.session.data.profile.baseProfile = baseProfile;
    }
    else {
        conversation.log("Profile does not exist: creating a new one...")
        conversation.session.data.profile = profile;
    }
    
    conversation.log(">>>>> conversation.session.");
    conversation.log(JSON.stringify(conversation.session.data, null, 2));
    
    await ctx.reply(ctx.t('profile-save-OK'));

    // Si l'utilisateur n'a pas encore de Photo de profil.
    if (conversation.session.data.profile.photos === undefined || conversation.session.data.profile.photos.length === 0) {
        
        console.debug("Début du chargement de la photo de profil");
        
        await doPhotoProfile(conversation, ctx);
        return;
    }
    // Leave the conversation:
    //throw new Error("Catch me if you can!");
}

export async function doPhotoProfile(conversation: photoProfileConversation, ctx: CustomContext) {
    console.debug("Inside doPhotoProfile conversation");
    // Demande à l'utilisateur s'il souhaite charger une photo de profil.
    await ctx.reply(ctx.t('profile-photo-upload-confirmation'), {
        reply_markup: inlineYesNoKeyboardButtons(ctx),
    });
    
    // Attend la réponse de l'utilisateur.
    const photoRes = await conversation.waitForCallbackQuery(["y", "n"],{
        otherwise: async (ctx: CustomContext) => {
            if (ctx.message?.text !== '/annuler' 
                && ctx.message?.text !== '/voir' 
                && ctx.message?.text !== '/profil')
                await ctx.reply(ctx.t('profile-use-buttons-error'), { reply_markup: inlineYesNoKeyboardButtons(ctx) })
        }
    });
    const confirmPhoto = photoRes.callbackQuery.data.match(/y/i) ? true : false;
    console.debug ("confirmation: ", confirmPhoto);

    if (confirmPhoto) {
        let isPhoto = false;
        
        let photoProfile: Photo[] = [];

        do {
            await ctx.reply(ctx.t('profile-photo-upload-confirmation-yes'));
            const photoCtx = await conversation.wait();
            
            if (photoCtx.message?.photo) {
                isPhoto = true;
                console.debug("Photo reçue!");
                console.debug(photoCtx.message.photo );
                //photo = photoCtx.message?.photo || [];
                photoCtx.message?.photo.forEach((p: any) => {
                    photoProfile.push({
                        file_id: p.file_id,
                        file_unique_id: p.file_unique_id,
                        file_size: p.file_size,
                        width: p.width,
                        height: p.height
                    });
                });
                console.debug("photoProfile");
                console.debug(photoProfile);
            }

            if (photoCtx.message?.text === "/annuler") {
                await ctx.reply(ctx.t('profile-photo-upload-cancel'));
                return;
            }
            if (photoCtx.message?.text === "/voir" || photoCtx.message?.text === "/profil")
                return; 
        } while (!isPhoto);
        if (conversation.session.data.profile.photos === undefined)
            conversation.session.data.profile.photos = [];
        
        //conversation.session.profile.photos.push(...photoProfile);
        conversation.session.data.profile.photos = photoProfile;
        
        await ctx.reply(ctx.t('profile-photo-received'));
    }
    else
        await ctx.reply(ctx.t('profile-photo-upload-confirmation-no'));
}

export async function deletePhotoProfile(conversation: deletePhotoProfileConversation, ctx: CustomContext) {
    console.debug("Inside deletePhotoProfile conversation");

    console.debug("Photo a supprimer pour userId: " + ctx.from!.id!);
    
    const userId = ctx.from?ctx.from.id:'undefined';
    if (!userId) {
        console.debug("userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }

    console.debug ("userId: " + userId);
    
    // Demande à l'utilisateur confirmation de suppression.
    await ctx.reply(ctx.t('profile-photo-delete-confirmation'), {
        reply_markup: inlineYesNoKeyboardButtons(ctx),
    });
    
     // Attend la réponse de l'utilisateur.
    const result = await conversation.waitForCallbackQuery(["y", "n"],{
        otherwise: async (ctx: CustomContext) => {
            if (ctx.message?.text !== '/annuler')
                await ctx.reply(ctx.t('profile-use-buttons-error'), { reply_markup: inlineYesNoKeyboardButtons(ctx) })
        }
    });
    const confirmation = result.callbackQuery.data.match(/y/i) ? true : false;
    console.debug ("confirmation: ", confirmation);

    if (confirmation) {    
        // Suppression de la photo de profil de la base de données.
        conversation.session.data.profile.photos = undefined;

        await ctx.reply(ctx.t('profile-photo-delete-OK'));
    }
    else
        await ctx.reply(ctx.t('profile-photo-delete-confirmation-no'));

}

/** Defines "deleteProfile" conversation */
export async function deleteProfile(conversation: deleteProfileConversation, ctx: CustomContext) {
    console.debug("Inside deleteProfile conversation");
    console.debug("Profile a supprimer pour userId: " + ctx.from!.id!);
    
    const userId = ctx.from?ctx.from.id:'undefined';
    if (!userId) {
        console.debug("userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }

    console.debug ("userId: " + userId);
    
    // Demande à l'utilisateur confirmation de suppression.
    await ctx.reply(ctx.t('profile-delete-confirmation'), {
        reply_markup: inlineYesNoKeyboardButtons(ctx),
    });
    
     // Attend la réponse de l'utilisateur.
    const result = await conversation.waitForCallbackQuery(["y", "n"],{
        otherwise: async (ctx: CustomContext) => {
            if (ctx.message?.text !== '/annuler')
                await ctx.reply(ctx.t('profile-use-buttons-error'), { reply_markup: inlineYesNoKeyboardButtons(ctx) })
        }
    });
    const confirmation = result.callbackQuery.data.match(/y/i) ? true : false;
    console.debug ("confirmation: ", confirmation);

    if (confirmation) {
        conversation.session.data.profile = createInitialProfile();
        
        console.debug("conversation.session.profile", JSON.stringify(conversation.session.data.profile));
        // Suppression du profile de la base de données.
        
        await ctx.reply(ctx.t('profile-delete-OK'));
    }
    else
        await ctx.reply(ctx.t('profile-delete-confirmation-no'));

    // Leave the conversation:
    // throw new Error("Catch me if you can!");
}

