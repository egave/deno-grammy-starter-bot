// https://stackoverflow.com/questions/76937418/conversation-touchs-other-sessions-in-grammy

import { InlineKeyboard } from 'grammyjs'
//import type { Conversation } from 'grammyConversations'
import { commandTranslations } from '../config.ts';
import type { CustomContext, MyConversation } from '../models/customContext.ts'
import { cleanInput, handleInvalidUserInput } from './utils/convUtils.ts'
import { nowUTC } from '../helpers/dateHelpers.ts'
import { CommunesByCodePostal } from '../ressources/communes-france-by-cp.ts'
import type { Commune } from '../models/communes.ts'
import { inlineYesNoKeyboardButtons,
    inlineGenderKeyboardButtons,
    inlineProfileMenuKeyboardButtons,
    inlineBirthdayDecadeKeyboardButtons,
    inlineBirthdayYearKeyboardButtons,
    inlineBirthdayMonthKeyboardButtons,
    inlineBirthdayDayKeyboardButtons
 } from '../helpers/inlineKeyboards.ts'
import { Photo, BaseProfile } from '../models/profile.ts'
import { UserActivityLog } from '../models/userActivityLog.ts'
import { logUserActivity } from '../service/dbUserActivityLog.ts'
import { Gender, Profile } from '../models/profile.ts'
import { getProfile, insertProfile, updateProfile, 
        deleteProfile, deletePhotoProfile } from '../service/dbProfile.ts'
import { TRIP_STATUS } from '../models/trip.ts'
import { getMyTrips } from '../service/dbTrip.ts'
import { getUserBookings } from '../service/dbBooking.ts'

//type profileConversation = Conversation<Context>;

/** Defines "doProfile" conversation */
export async function doProfile(conversation: MyConversation, ctx: CustomContext) {
    console.log("Inside doProfile conversation");
    const userId = ctx.from ? ctx.from.id : null;

    if (!userId) {
        await conversation.error("doProfile: userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }

    await conversation.log(`doProfile for userId: ${userId}`);
    const profile = await getProfile(userId);

    // Le profile n'existe pas
    if (!profile) {
        const confirmNewProfileRes = await confirmNewProfile(conversation, ctx);
        
        if (!confirmNewProfileRes) {
            await ctx.reply(ctx.t('profile-create-no'));
            return;
        }
        else {
            // ask the user the questions for the baseProfile
            const baseProfile: BaseProfile | undefined = await doBaseProfile(conversation, ctx);
            // in case baseProfile could not be created successfully, quit the conversation 
            if (!baseProfile)
                return;

            // ask the user for the bio
            const bio: string | undefined = await doBio(conversation, ctx);
            
            const p: Profile = new Profile(nowUTC(), baseProfile, bio);

            // ask the user the questions for the photo
            const photo: Photo[] | undefined = await doPhotoProfile(conversation, ctx);
            if (photo) {
                p.photos = photo;
                await ctx.reply(ctx.t('profile-photo-upload-OK'));
            } else {
                await ctx.reply(ctx.t('profile-photo-upload-confirmation-no'));
            }
            
            // Insert profile to the database
            await conversation.external(async () =>  {
                const insertProfileRes = await insertProfile(p);
                if (insertProfileRes.ok) {
                    const actionLog: UserActivityLog = {
                        action: "create_profile",
                        userId: p.getUserId(),
                        versionstamp: insertProfileRes.versionstamp
                    };
                    await logUserActivity(actionLog);
                
                    await ctx.reply(ctx.t('profile-save-new-OK'));
                }
                else {
                    // Log the error as part of user activity
                    let msg = "Unkwown error occurred while inserting the profile.";
                    if (insertProfileRes.errorCode === "ERR_PROFILE_EXISTS")
                        msg = `Cannot insert profile. Profile with ID ${p.getUserId()} already exists.`
                    else if (insertProfileRes.errorCode === "ERR_MAX_RETRIES_EXCEEDED")
                        msg = `Too many retries while inserting the profile with ID ${p.getUserId()}.`
                    
                    const actionErrorLog: UserActivityLog = {
                        action: "create_profile",
                        userId: p.getUserId(),
                        error: {
                            code: insertProfileRes.errorCode,
                            message: msg
                        },
                        details: { profileData: p }, // Include relevant context
                    };

                    await logUserActivity(actionErrorLog);

                    await ctx.reply(ctx.t('profile-save-KO'));
                }
            }); // End of conversation.external
        }
    }
    // Le profile existe déjà
    else {
        const action = await askForProfileMenu(conversation, ctx, profile);

        switch (action) {
            // case "display":
            //     await conversation.log("displayProfile");
            //     await displayProfile(ctx, profile);
            // break;
            case "do-base": {
                await conversation.log("editProfile");
                const baseProfile: BaseProfile | undefined = await doBaseProfile(conversation, ctx);
                if (!baseProfile)
                    return;

                profile.baseProfile = baseProfile;
                // Ask the user the questions for the photo only if no photo
                if (profile.photos === undefined || profile.photos.length === 0) {
                    const photo: Photo[] | undefined = await doPhotoProfile(conversation, ctx);
                    if (photo) {
                        profile.photos = photo;
                        await ctx.reply(ctx.t('profile-photo-upload-OK'));
                    } else {
                        await ctx.reply(ctx.t('profile-photo-upload-confirmation-no'));
                    }
                }
                await conversation.external(async () =>  {
                    const updateProfileRes = await updateProfile(profile);
                
                    if (updateProfileRes.ok) {
                        const actionLog: UserActivityLog = {
                            action: "update_profile",
                            userId: profile.getUserId(),
                            versionstamp: updateProfileRes.versionstamp,
                            details: { sub_action: "edit_profile" }
                        };
                        await logUserActivity(actionLog);
                    
                        await ctx.reply(ctx.t('profile-save-OK'));
                    } else {
                        // Log the error as part of user activity
                        let msg = "Unkwown error occurred while updating the profile.";
                        if (updateProfileRes.errorCode === "ERR_PROFILE_MISMATCH")
                            msg = `Cannot delete, Profile mismatch ${profile.getUserId()} not found`;
                        else if (updateProfileRes.errorCode === "ERR_PROFILE_NOT_FOUND")
                            msg = `Cannot delete, Profile ${profile.getUserId()} not found`;
                        else if (updateProfileRes.errorCode === "ERR_MAX_RETRIES_EXCEEDED")
                            msg = `Too many retries while updating the profile with ID ${profile.getUserId()}.`

                        // Log the error as part of user activity
                        const actionErrorLog: UserActivityLog = {
                            action: "update_profile",
                            userId: profile.getUserId(),
                            error: {
                                code: updateProfileRes.errorCode,
                                message: msg
                            },
                            details: { sub_action: "edit_profile",
                                    profileData: profile }, // Include relevant context
                        };
        
                        await logUserActivity(actionErrorLog);
        
                        await ctx.reply(ctx.t('profile-save-KO'));
                    }
                }); // End of conversation.external
            }
            break;
            case "delete": {
                await conversation.log("deleteProfile");
                // L'utilisateur veut supprimer son compte Lib'Auto
                // On vérifie d'abord s'il a des réservations ou trajets en cours
                const canDelete: boolean = await conversation.external(async () =>  {
                    const userBookings = await getUserBookings(profile.getUserId());
                    const userTrips = await getMyTrips(profile.getUserId(), [
                          TRIP_STATUS.PUBLISHED, 
                          TRIP_STATUS.FULL
                        ]);
                    if (userBookings.length > 0 || userTrips.length > 0) {
                        await ctx.reply(ctx.t('profile-delete-cancel-first', 
                            { "booking-nbr": userBookings.length,
                                "trip-nbr": userTrips.length
                             }));
                        return false;
                    }
                    return true;
                }); // End of conversation.external
                if (!canDelete)
                    return;

                const confirmation = await confirmDeleteProfile(conversation, ctx);
                if (confirmation) {
                    await conversation.external(async () =>  {
                        const deleteProfileRes = await deleteProfile(profile.getUserId());
                    
                        if (deleteProfileRes.ok) {
                            const actionLog: UserActivityLog = {
                                action: "delete_profile",
                                userId: profile.getUserId(),
                                versionstamp: deleteProfileRes.versionstamp
                            };
                            await logUserActivity(actionLog);
                        
                            await ctx.reply(ctx.t('profile-delete-OK'),
                                    {parse_mode: "HTML"});
                        }
                        else {
                            // Log the error as part of user activity
                            let msg = "Unkwown error occurred while deleting the profile.";
                            if (deleteProfileRes.errorCode === "ERR_PROFILE_NOT_FOUND")
                                msg = `Cannot delete, Profile ${profile.getUserId()} not found`;
                            else if (deleteProfileRes.errorCode === "ERR_MAX_RETRIES_EXCEEDED")
                                msg = `Too many retries while deleting the profile with ID ${profile.getUserId()}.`

                            // Log the error as part of user activity
                            const actionErrorLog: UserActivityLog = {
                                action: "delete_profile",
                                userId: profile.getUserId(),
                                error: {
                                    code: deleteProfileRes.errorCode,
                                    message: msg
                                },
                                details: { profileData: profile }, // Include relevant context
                            };
            
                            await logUserActivity(actionErrorLog);
            
                            await ctx.reply(ctx.t('profile-delete-KO'));
                        }
                    }); // End of conversation.external
                }
                else {
                    await ctx.reply(ctx.t('profile-delete-confirmation-no'));
                }
            }
            break;
            case "do-photo": {
                    await conversation.log("doPhoto");
                    const photo: Photo[] | undefined = await doPhotoProfile(conversation, ctx);
                    if (photo) {
                        profile.photos = photo;
                        await conversation.external(async () =>  {
                            const updateProfileRes = await updateProfile(profile);
                        
                            if (updateProfileRes.ok) {
                                const actionLog: UserActivityLog = {
                                    action: "update_profile",
                                    userId: profile.getUserId(),
                                    versionstamp: updateProfileRes.versionstamp,
                                    details: { sub_action: "save_photo" }
                                };
                                await logUserActivity(actionLog);
                            
                                await ctx.reply(ctx.t('profile-photo-changed-OK'));
                            } else {
                                // Log the error as part of user activity
                                let msg = "Unkwown error occurred while updating the profile.";
                                if (updateProfileRes.errorCode === "ERR_PROFILE_MISMATCH")
                                    msg = `Cannot update, Profile mismatch ${profile.getUserId()} not found`;
                                else if (updateProfileRes.errorCode === "ERR_PROFILE_NOT_FOUND")
                                    msg = `Cannot update, Profile ${profile.getUserId()} not found`;
                                else if (updateProfileRes.errorCode === "ERR_MAX_RETRIES_EXCEEDED")
                                    msg = `Too many retries while updating the profile with ID ${profile.getUserId()}.`
            
                                // Log the error as part of user activity
                                const actionErrorLog: UserActivityLog = {
                                    action: "update_profile",
                                    userId: profile.getUserId(),
                                    error: {
                                        code: updateProfileRes.errorCode,
                                        message: msg
                                    },
                                    details: { sub_action: "save_photo",
                                                profileData: profile } // Include relevant context
                                };
                
                                await logUserActivity(actionErrorLog);
                
                                await ctx.reply(ctx.t('profile-photo-upload-KO'));
                            }
                        }); // End of conversation.external
                    } else {
                        if (profile.photos === undefined || profile.photos.length === 0)
                            await ctx.reply(ctx.t('profile-photo-upload-confirmation-no'));
                        else 
                            await ctx.reply(ctx.t('profile-photo-change-confirmation-no'));
                    }
                }
            break;
            case "delete-photo": {
                await conversation.log("deletePhoto");
                const confirmation = await confirmDeletePhotoProfile(conversation, ctx);
                if (confirmation) {    
                    // Suppression de la photo de profile de la base de données.
                    await conversation.external(async () =>  {
                        const deletePhotoProfileRes = await deletePhotoProfile(profile);
                    
                        if (deletePhotoProfileRes.ok) {
                            const actionLog: UserActivityLog = {
                                action: "update_profile",
                                userId: profile.getUserId(),
                                versionstamp: deletePhotoProfileRes.versionstamp,
                                details: { sub_action: "delete_photo" }
                            };
                            await logUserActivity(actionLog);
                        
                            await ctx.reply(ctx.t('profile-photo-delete-OK'));
                        } else {
                            // Log the error as part of user activity
                            let msg = "Unkwown error occurred while deleting the photo profile.";
                            if (deletePhotoProfileRes.errorCode === "ERR_PROFILE_MISMATCH")
                                msg = `Cannot delete photo, Profile mismatch ${profile.getUserId()} not found`;
                            else if (deletePhotoProfileRes.errorCode === "ERR_PROFILE_NOT_FOUND")
                                msg = `Cannot delete photo, Profile ${profile.getUserId()} not found`;
                            else if (deletePhotoProfileRes.errorCode === "ERR_MAX_RETRIES_EXCEEDED")
                                msg = `Too many retries while deleting the photo profile with ID ${profile.getUserId()}.`
        
                            // Log the error as part of user activity
                            const actionErrorLog: UserActivityLog = {
                                action: "update_profile",
                                userId: profile.getUserId(),
                                error: {
                                    code: deletePhotoProfileRes.errorCode,
                                    message: msg
                                },
                                details: { sub_action: "delete_photo",
                                            profileData: profile }, // Include relevant context
                            };
            
                            await logUserActivity(actionErrorLog);
            
                            await ctx.reply(ctx.t('profile-photo-delete-KO'));
                        }
                    }); // End of conversation.external
                }
                else
                    await ctx.reply(ctx.t('profile-photo-delete-confirmation-no'));
            }
            break;
            case "do-bio": {
                await conversation.log("doBio");
                // Ask the user for the bio
                const bio: string | undefined = await doBio(conversation, ctx, profile);
                if (bio !== undefined) {
                    profile.bio = bio;
                    await conversation.external(async () =>  {
                        const updateProfileRes = await updateProfile(profile);
                    
                        if (updateProfileRes.ok) {
                            const actionLog: UserActivityLog = {
                                action: "update_profile",
                                userId: profile.getUserId(),
                                versionstamp: updateProfileRes.versionstamp,
                                details: { sub_action: "edit_bio" }
                            };
                            await logUserActivity(actionLog);
                        
                            await ctx.reply(ctx.t('profile-bio-save-OK'));
                        } else {
                            // Log the error as part of user activity
                            let msg = "Unkwown error occurred while updating the profile.";
                            if (updateProfileRes.errorCode === "ERR_PROFILE_MISMATCH")
                                msg = `Cannot delete, Profile mismatch ${profile.getUserId()} not found`;
                            else if (updateProfileRes.errorCode === "ERR_PROFILE_NOT_FOUND")
                                msg = `Cannot delete, Profile ${profile.getUserId()} not found`;
                            else if (updateProfileRes.errorCode === "ERR_MAX_RETRIES_EXCEEDED")
                                msg = `Too many retries while updating the profile with ID ${profile.getUserId()}.`

                            // Log the error as part of user activity
                            const actionErrorLog: UserActivityLog = {
                                action: "update_profile",
                                userId: profile.getUserId(),
                                error: {
                                    code: updateProfileRes.errorCode,
                                    message: msg
                                },
                                details: { sub_action: "edit_bio",
                                        profileData: profile }, // Include relevant context
                            };
            
                            await logUserActivity(actionErrorLog);
            
                            await ctx.reply(ctx.t('profile-bio-save-KO'));
                        }
                    }); // End of conversation.external
                } else {
                    await ctx.reply(ctx.t('profile-bio-save-canceled'));
                }
                /*
                // Read session data inside a conversation.
                const session = await conversation.external((ctx: CustomContext) => ctx.session);
                // Change the session data inside a conversation.
                session.data.route = 'bio';
                // Save session data inside a conversation.
                await conversation.external((ctx: CustomContext) => {
                    ctx.session = session;
                });
                if (profile.bio)
                    await ctx.reply(ctx.t('profile-modify-bio'));
                else
                    await ctx.reply(ctx.t('profile-write-bio'));
                */
            }
            break;
            default:
                await conversation.error("There is no such action: " + action);
                break;
        }

    }
}

// Define the function to ask if user wants to create a new profile
async function confirmNewProfile(
    conversation: MyConversation, 
    ctx: CustomContext
): Promise<boolean> {

    // Ask the user if he wants to add create a new profile
    await ctx.reply(ctx.t('profile-create'), {
        reply_markup: inlineYesNoKeyboardButtons(ctx)
    });
    
    // Listen for user responses via callback data
    const response = await conversation.waitForCallbackQuery(["y", "n"], {
        otherwise: async (ctx: CustomContext) => {
            await handleInvalidUserInput(ctx);
        }
    });

    // Handle return
    if (response.callbackQuery.data.match(/y/i)) {
        return true;
    }
    
    return false;
}

/** Defines "creerProfile" conversation */
async function doBaseProfile(
    conversation: MyConversation, 
    ctx: CustomContext) : Promise<BaseProfile | undefined>
{
    console.log("Inside doBaseProfile conversation");
    
    // Asking for the gender
    const gender: Gender = await askForGender(conversation, ctx);

    // Asking for the age
    const birthday: number | undefined = await askForBirthday(conversation, ctx, gender);
    if (!birthday) {
        await ctx.reply(ctx.t('profile-birthday-skiped'));
    }
    // Asking for the municipality
    //const { postal_code_text, chosenCommune } = await askForMunicipality(conversation, ctx, 'profile-create-step3');
    
    await conversation.log("birthday: ", birthday);
    await conversation.log("username: ", ctx.from?.username);
    await conversation.log("first_name: ", ctx.from?.first_name);
    await conversation.log("last_name: ", ctx.from?.last_name);
    const baseProfile: BaseProfile = new BaseProfile( 
        ctx.from!.id,
        ctx.from!.first_name, 
        gender, 
        birthday,
        // postal_code: postal_code_text,
        // commune: chosenCommune, 
        ctx.from?.username, 
        ctx.from?.last_name);

    await conversation.log("baseProfile: ", baseProfile);
    return baseProfile;
}


// Function that asks for usr gender
async function askForGender(
    conversation: MyConversation, 
    ctx: CustomContext
): Promise<Gender> {

    // Demande à l'utilisateur son Gender.
    await ctx.reply(ctx.t('profile-create-step1'), {
        reply_markup: inlineGenderKeyboardButtons(ctx),
    });

    // Attend la réponse de l'utilisateur.
    const resGender = await conversation.waitForCallbackQuery(["w", "m"],{
        otherwise: async (ctx: CustomContext) => {
            await handleInvalidUserInput(ctx);
        }
    });
    const gender: Gender = resGender.callbackQuery.data.match(/w/i)? Gender.Woman : Gender.Man;
    await conversation.log("gender: ", gender);
    
    return gender;
};

// Function that asks for user birthday
async function askForBirthday(
    conversation: MyConversation, 
    ctx: CustomContext,
    g: Gender
): Promise<number | undefined> {
    
    // Asking for the birthdayDecade
    const birthdayDecade: string = await askForBirthdayDecade(conversation, ctx, g);
    if (birthdayDecade === 'birthday-skip')
        return;

    // Asking for the birthdayYear
    const birthdayYear: string = await askForBirthdayYear(conversation, ctx, birthdayDecade!);
    // Asking for the birthdayMonth
    const birthdayMonth: string = await askForBirthdayMonth(conversation, ctx, birthdayYear!);
    // Asking for the birthdayDay
    const birthdayDay: string = await askForBirthdayDay(conversation, ctx, birthdayYear!, birthdayMonth!);

    if (!birthdayYear ||!birthdayMonth ||!birthdayDay)
        return;
    
    const birthday = new Date(Date.UTC(parseInt(birthdayYear), parseInt(birthdayMonth) - 1, parseInt(birthdayDay)));
    const birthdayTimestamp = birthday.getTime() / 1000; // Convert to seconds
    await conversation.log("birthday: " + birthdayYear + "-" + birthdayMonth + "-" + birthdayDay);
    await conversation.log("birthday: ", birthdayTimestamp);
    await conversation.log("Birthday Date:", new Date(birthdayTimestamp * 1000));
    
    return birthdayTimestamp;
};

async function askForBirthdayDecade(
    conversation: MyConversation, 
    ctx: CustomContext,
    g: Gender
): Promise<string> {
    let selectedDecade: string;

    // Send the first message with the inline keyboard
    const { inlineKeyboard, decadeValues } = inlineBirthdayDecadeKeyboardButtons(ctx);
    await conversation.log("decadeValues : ", decadeValues);
    
    // Demande à l'utilisateur sa décennie.
    const message = await ctx.reply(ctx.t('profile-ask-for-decade', { gender: g }), {
        reply_markup: inlineKeyboard,
    });
    const chat_id = ctx.from?.id;
    const msg_id = message.message_id;

    do {
        // Listen for user responses via callback data
        const response = await conversation.waitForCallbackQuery(decadeValues, {
            otherwise: async (ctx: CustomContext) => {
                await handleInvalidUserInput(ctx);
            }
        });
        await conversation.log("response.callbackQuery.data: ", response.callbackQuery.data);

        // On extrait le mois et l'année de la donnée de callback
        selectedDecade = response.callbackQuery.data;
    } while (!selectedDecade);

    // Gestion des messages si l'étape de la date de naissance a été passée
    let returnedMessage = 'birthday-decade-selected';
    if (selectedDecade === 'birthday-skip')
        returnedMessage = 'birthday-skipped';
        
    // Clear the inline keyboard and show the selected decade
    const resultInlineKeyboard = new InlineKeyboard();
    resultInlineKeyboard.text(ctx.t(returnedMessage, {
        "decade": selectedDecade
        }),
        'void');

    await ctx.editMessageReplyMarkup({
        reply_markup: resultInlineKeyboard,
        chat_id: chat_id,
        message_id: msg_id
    });

    return selectedDecade;
};

async function askForBirthdayYear(
    conversation: MyConversation, 
    ctx: CustomContext,
    decade: string
): Promise<string> {
    let selectedYear: string;

    // Send the first message with the inline keyboard
    const { inlineKeyboard, yearValues } = inlineBirthdayYearKeyboardButtons(decade);
    await conversation.log("yearValues : ", yearValues);

    // Demande à l'utilisateur sa décennie.
    const message = await ctx.reply(ctx.t('profile-ask-for-year'), {
        reply_markup: inlineKeyboard,
    });
    const chat_id = ctx.from?.id;
    const msg_id = message.message_id;

    do {
        // Listen for user responses via callback data
        const response = await conversation.waitForCallbackQuery(yearValues, {
            otherwise: async (ctx: CustomContext) => {
                await handleInvalidUserInput(ctx);
            }
        });

        await conversation.log("response.callbackQuery.data: ", response.callbackQuery.data);

        // On extrait le mois et l'année de la donnée de callback
        selectedYear = response.callbackQuery.data;
    } while (!selectedYear);

    // Clear the inline keyboard and show the selected decade
    const resultInlineKeyboard = new InlineKeyboard();
    resultInlineKeyboard.text(ctx.t('birthday-year-selected', {
        "year": selectedYear
        }));

    await ctx.editMessageReplyMarkup({
        reply_markup: resultInlineKeyboard,
        chat_id: chat_id,
        message_id: msg_id
    });

    return selectedYear;
};


async function askForBirthdayMonth(
    conversation: MyConversation, 
    ctx: CustomContext,
    year: string
): Promise<string> {
    let selectedMonth: string;

    // Send the first message with the inline keyboard
    const { inlineKeyboard, monthValues } = inlineBirthdayMonthKeyboardButtons(ctx, year);
    await conversation.log("monthValues : ", monthValues);

    // Demande à l'utilisateur sa décennie.
    const message = await ctx.reply(ctx.t('profile-ask-for-month'), {
        reply_markup: inlineKeyboard,
    });
    const chat_id = ctx.from?.id;
    const msg_id = message.message_id;

    do {
        // Listen for user responses via callback data
        const response = await conversation.waitForCallbackQuery(monthValues, {
            otherwise: async (ctx: CustomContext) => {
                await handleInvalidUserInput(ctx);
            }
        });

        await conversation.log("response.callbackQuery.data: ", response.callbackQuery.data);

        // On extrait le mois et l'année de la donnée de callback
        selectedMonth = response.callbackQuery.data;
    } while (!selectedMonth);

    // Clear the inline keyboard and show the selected decade
    const resultInlineKeyboard = new InlineKeyboard();
    resultInlineKeyboard.text(ctx.t('birthday-month-selected', {
        "month": selectedMonth.split('_')[1]
        }));

    await ctx.editMessageReplyMarkup({
        reply_markup: resultInlineKeyboard,
        chat_id: chat_id,
        message_id: msg_id
    });

    return selectedMonth;
};

async function askForBirthdayDay(
    conversation: MyConversation, 
    ctx: CustomContext,
    year: string,
    month: string
): Promise<string> {
    let selectedDay: string;

    // Send the first message with the inline keyboard
    const { inlineKeyboard, dayValues } = inlineBirthdayDayKeyboardButtons(ctx, year, month.split('_')[0]);
    
    // Demande à l'utilisateur sa décennie.
    const message = await ctx.reply(ctx.t('profile-ask-for-day'), {
        reply_markup: inlineKeyboard,
    });
    const chat_id = ctx.from?.id;
    const msg_id = message.message_id;

    do {
        // Listen for user responses via callback data
        const response = await conversation.waitForCallbackQuery(dayValues, {
            otherwise: async (ctx: CustomContext) => {
                await handleInvalidUserInput(ctx);
            }
        });

        await conversation.log("response.callbackQuery.data: ", response.callbackQuery.data);

        // On extrait le mois et l'année de la donnée de callback
        selectedDay = response.callbackQuery.data;
    } while (!selectedDay);

    // Clear the inline keyboard and show the selected decade
    const resultInlineKeyboard = new InlineKeyboard();
    resultInlineKeyboard.text(ctx.t('birthday-day-selected', {
        "day": selectedDay
        }));

    await ctx.editMessageReplyMarkup({
        reply_markup: resultInlineKeyboard,
        chat_id: chat_id,
        message_id: msg_id
    });

    return selectedDay;
};

// Function that asks for user age
async function askForAge(
    conversation: MyConversation, 
    ctx: CustomContext,
    g: Gender
): Promise<number | undefined> {

    // Demande à l'utilisateur son âge.
    await ctx.reply(ctx.t('profile-create-step2', { gender: g }));

    let age = 0;
    do {
        // Attend la réponse de l'utilisateur.
        age = await conversation.form.int({
            otherwise:  async (ctx: CustomContext) => {
                if (!ctx.message?.text?.startsWith('/'))
                    await ctx.reply(ctx.t('profile-expected-number-error'));
            }
        });
        if (age < 18) {
            await ctx.reply(ctx.t('profile-age-minor-error', {
                "delai": 18 - age
                }),
                {parse_mode: "HTML"}
            );
            return;
        } else if (age > 99)
            await ctx.reply(ctx.t('profile-age-senior-error', { "age": age }));
        
        await conversation.log("age: " + age);
    } while (age < 18 || age > 99);

    return age;
}


// Define the function to ask for the municipality (Commune)
async function askForMunicipality(
    conversation: MyConversation, 
    ctx: CustomContext, 
    promptPostalCode: string
): Promise<{postal_code_text: string, chosenCommune: Commune}> {
    await ctx.reply(ctx.t(promptPostalCode));

    let postalCode = 0;
    let postal_code_text: string = "";
    let communes: Commune[] = [];
    
    // Get a valid postal code and associated communes
    do {
        postalCode = await conversation.form.int({
            otherwise: async (ctx: CustomContext) => {
                if (!ctx.message?.text?.startsWith('/')) {
                    await ctx.reply(ctx.t('expected-number-error'));
                }
            }
        });

        if (isNaN(postalCode) || postalCode < 1000 || postalCode > 99000) {
            await ctx.reply(ctx.t('postalCode-number-error'));
        } else {
            postal_code_text = postalCode.toString().padStart(5, '0');
            communes = CommunesByCodePostal[postal_code_text];
            if (!communes || communes.length === 0) {
                await ctx.reply(ctx.t('postalCode-not-found-error', {
                    'code-postal': postal_code_text
                }), {
                    parse_mode: "HTML",
                });
            }
        }
    } while (isNaN(postalCode) || postalCode < 1000 || postalCode > 99000 || !communes || communes.length === 0);

    // Choose a municipality if there are multiple options
    let chosenCommune: Commune = communes[0];
    if (communes.length > 1) {
        await conversation.log("More than one commune: ", communes.length);
        const callback_data: string[] = [];
        const inlineMunicipalityKeyboard = new InlineKeyboard();

        // Generate the inline keyboard for the municipality options
        for (let i = 0; i < communes.length; i++) {
            callback_data.push(i.toString());
            inlineMunicipalityKeyboard.text(communes[i].nom_commune_complet, i.toString());
            if (i > 0 && i % 2 === 0) {
                inlineMunicipalityKeyboard.row();
            }
        }

        // Ask the user to select a municipality
        const message = await ctx.reply(ctx.t('trip-choose-municipality'), {
            reply_markup: inlineMunicipalityKeyboard,
        });
        const chat_id = ctx.from?.id;
        const msg_id = message.message_id;

        // Wait for the user's selection via callback query
        const resMunicipality = await conversation.waitForCallbackQuery(callback_data, {
            otherwise: async (ctx: CustomContext) => {
                await handleInvalidUserInput(ctx);
            }
        });
        
        chosenCommune = communes[Number(resMunicipality.callbackQuery.data)];

        // Clear the inline keyboard and show the selected street type
        const resultInlineKeyboard = new InlineKeyboard();
        resultInlineKeyboard.text(ctx.t('trip-chosen-municipality', {
                "municipality": chosenCommune.nom_commune_complet,
                "postal_code": chosenCommune.code_postal
            })
            , 'void');

        await ctx.editMessageReplyMarkup({
            reply_markup: resultInlineKeyboard,
            chat_id: chat_id,
            message_id: msg_id
        });
    }

    return {postal_code_text, chosenCommune}; // Return the chosen municipality
}

// Define the function to ask for a street type
async function askForProfileMenu(
    conversation: MyConversation, 
    ctx: CustomContext, p: Profile
): Promise<string | undefined>
{
    const hasPhotos: boolean = (p.photos !== undefined && p.photos.length > 0);
    const hasBio: boolean = p.bio !== undefined;

    let selectedAction: string| undefined = undefined;

    // Send the first message with the inline keyboard
    const { inlineKeyboard, profileMenuValues } = inlineProfileMenuKeyboardButtons(ctx, hasPhotos, hasBio);
    
    //await displayProfileMenu(ctx, p, inlineKeyboard);
    await p.display(ctx, inlineKeyboard);
    
    // await ctx.reply(ctx.t(prompt), {
    //     reply_markup: inlineKeyboard,
    // });  

    // Listen for user responses via callback data
    const response = await conversation.waitForCallbackQuery(profileMenuValues, {
        otherwise: async (ctx: CustomContext) => {
            await handleInvalidUserInput(ctx);
        }
    });

    selectedAction = response.callbackQuery.data;
    await conversation.log("Selected action: " + selectedAction);

    return selectedAction;
}

async function confirmPhotoProfile(
    conversation: MyConversation, 
    ctx: CustomContext): Promise<boolean> 
{
    await conversation.log("Inside confirmPhotoProfile conversation");
    // Demande à l'utilisateur s'il souhaite charger une photo de profile.
    await ctx.reply(ctx.t('profile-photo-upload-confirmation'), {
        reply_markup: inlineYesNoKeyboardButtons(ctx),
    });
    
    // Attend la réponse de l'utilisateur.
    const photoRes = await conversation.waitForCallbackQuery(["y", "n"], {
        otherwise: async (ctx: CustomContext) => {
            await handleInvalidUserInput(ctx);
        }
    });
    const confirmPhoto = photoRes.callbackQuery.data.match(/y/i) ? true : false;
    
    return confirmPhoto;
}

async function doBio(
    conversation: MyConversation, 
    ctx: CustomContext,
    profile?:Profile): Promise<string | undefined> 
{
    await conversation.log("Inside doBio conversation");
    if (profile && profile.bio)
        await ctx.reply(ctx.t('profile-modify-bio'));
    else
        await ctx.reply(ctx.t('profile-write-bio'));

    // Attend la réponse de l'utilisateur.
    const bio = await conversation.waitFor(":text");

    const receivedText = bio.msg.text?.replace(/^\//, '');
    if (receivedText && commandTranslations.skip.includes(receivedText)) {
        return;
    }

    return cleanInput(bio.msg.text);
}

async function doPhotoProfile(
    conversation: MyConversation, 
    ctx: CustomContext): Promise<Photo[] | undefined> 
{
    await conversation.log("Inside doPhotoProfile conversation");
    // Demande à l'utilisateur s'il souhaite charger une photo de profile.
   
    let isPhoto = false;
    
    const photoProfile: Photo[] = [];

    do {
        await ctx.reply(ctx.t('profile-photo-upload-confirmation-yes'));
        const photoCtx = await conversation.wait();
        
        if (photoCtx.message?.photo) {
            isPhoto = true;
            await conversation.log("Photo reçue!");
            //await conversation.log(photoCtx.message.photo);
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
        }
        const receivedText = photoCtx.message?.text?.replace(/^\//, '');
        if (receivedText && commandTranslations.skip.includes(receivedText)) {
            return;
        }
    } while (!isPhoto);

    return photoProfile;
}

export async function confirmDeletePhotoProfile(
    conversation: MyConversation,
    ctx: CustomContext): Promise<boolean | undefined>
{
    await conversation.log("Inside confirmDeletePhotoProfile conversation");

    const userId = ctx.from?ctx.from.id:'undefined';
    if (!userId) {
        await conversation.log("userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }
    
    // Demande à l'utilisateur confirmation de suppression.
    await ctx.reply(ctx.t('profile-photo-delete-confirmation'), {
        reply_markup: inlineYesNoKeyboardButtons(ctx),
    });
    
     // Attend la réponse de l'utilisateur.
    const result = await conversation.waitForCallbackQuery(["y", "n"],{
        otherwise: async (ctx: CustomContext) => {
            await handleInvalidUserInput(ctx);
        }
    });
    const confirmation = result.callbackQuery.data.match(/y/i) ? true : false;
    return confirmation;
}

/** Defines "deleteProfile" conversation */
export async function confirmDeleteProfile(
    conversation: MyConversation, 
    ctx: CustomContext): Promise<boolean | undefined>
{
    await conversation.log("Inside confirmDeleteProfile");
    await conversation.log("Profil à supprimer pour userId: " + ctx.from!.id!);
    
    const userId = ctx.from?ctx.from.id:'undefined';
    if (!userId) {
        await conversation.log("userId is undefined");
        await ctx.reply(ctx.t('userId-undefined'));
        return;
    }

    await conversation.log("userId: " + userId);
    
    // Demande à l'utilisateur confirmation de suppression.
    await ctx.reply(ctx.t('profile-delete-confirmation'), {
        reply_markup: inlineYesNoKeyboardButtons(ctx),
        parse_mode: "HTML"
    });
    
     // Attend la réponse de l'utilisateur.
    const result = await conversation.waitForCallbackQuery(["y", "n"],{
        otherwise: async (ctx: CustomContext) => {
            await handleInvalidUserInput(ctx);    
        }
    });
    const confirmation = result.callbackQuery.data.match(/y/i) ? true : false;
    
    return confirmation;
}
