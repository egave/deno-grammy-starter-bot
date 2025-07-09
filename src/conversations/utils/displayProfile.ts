import type { CustomContext, MyConversation } from '../../models/customContext.ts'
import { Message } from 'grammy-types-message'
import { handleInvalidUserInput } from '../utils/convUtils.ts'
import { askForMessageToSend } from '../utils/tripUtils.ts'
import { reportProfile } from '../utils/reportProfile.ts'
import { Profile } from '../../models/profile.ts'
import { Report } from '../../models/report.ts'
import { insertNewReport } from '../../service/dbReport.ts'
import { inlineDisplayProfileMenuKeyboardButtons } from '../../helpers/inlineKeyboards.ts'
import { sendToAdmin } from '../../helpers/sendToAdmin.ts'
import { sendDirectMessage } from '../../helpers/sendNotifications.ts'

/** Function "displayProfile" */
export async function displayProfile(
    conversation: MyConversation, 
    ctx: CustomContext,
    prompt: string,
    idTripContext: string,
    profile: Profile,
    backButtonLabel?: string,
    canSendMessage: boolean = true
): Promise<{updateMessage: string}>
{
    const title = ctx.t(prompt);
    
    const { inlineKeyboard, displayProfileValues } = inlineDisplayProfileMenuKeyboardButtons(ctx, canSendMessage, backButtonLabel);
    await conversation.log("displayProfileValues : ", displayProfileValues);
    // Fonction pour mettre à jour le message avec les informations actuelles du profil
    let file_id;
    let message: Message; // Declare message here to scope it to the main block
    if (profile.photos && profile.photos.length > 0) {
        file_id = profile.photos[0].file_id;
        try {
            message = await ctx.api.sendPhoto(ctx.from!.id, file_id,
                { caption: profileCard(ctx, title, profile),
                    reply_markup: inlineKeyboard,
                    parse_mode: "HTML",
                });
        } catch (error) {
            await conversation.error(`Failed to send photo with file_id ${file_id}:`, error);
            message = await ctx.reply(
                profileCard(ctx, title, profile), {
                    reply_markup: inlineKeyboard,
                    parse_mode: "HTML"
                });
        }
    } else {
        message = await ctx.reply(
            profileCard(ctx, title, profile), {
                reply_markup: inlineKeyboard,
                parse_mode: "HTML"
            });
    }

    while (true) {
        // Listen for user responses via callback data
        const response = await conversation.waitForCallbackQuery(displayProfileValues, {
            otherwise: async (ctx: CustomContext) => {
                await handleInvalidUserInput(ctx);
            }
        });
        const action = response.callbackQuery.data;
        await conversation.log("response.callbackQuery.data: ", action);

        // Handle pagination
        if (action.match(new RegExp('back', 'i'))) {
            if (message) {
                await ctx.api.deleteMessage(ctx.chat!.id, message.message_id);
            }
            return {updateMessage: action};
        } else if (action.match(new RegExp('report-profile', 'i'))) {
            await conversation.log("User wants to report the profile");
            const reason = await reportProfile(conversation, ctx);
            if (!reason) {
                //await ctx.reply(ctx.t("report-profile-canceled"));
                await conversation.log("Reporting profile canceled");
            }
            else {
                // Enregistrer le signalement en BDD
                try {
                    const report: Report = new Report(ctx.from!.id, profile.baseProfile.userId, reason);
                    const addRes = await insertNewReport(report);
                    await ctx.reply(ctx.t("report-profile-success"));
                    await sendToAdmin(ctx, ctx.t("report-new-report", { "user-id": ctx.from!.id }));
                }
                catch (error) {
                    await ctx.reply(ctx.t("report-profile-error"));
                    await conversation.error("Error inserting report into DB: ", error);
                }
                return {updateMessage: action};
            }
        } else if (action.match(new RegExp('send-message', 'i'))) {
            await conversation.log("User wants to send a message");
            // Asking for message
            const message = await askForMessageToSend(conversation, ctx);
            if (message) {
                const resMsg = await sendDirectMessage(ctx, idTripContext, message, profile.baseProfile.userId);
                if (resMsg.ok) {
                    await ctx.reply(ctx.t("profile-message-sent"));
                } else {
                    await conversation.error(`Error sending message to user ${profile.baseProfile.userId}: ${resMsg.message}`);
                    const hasProfile: number = profile? 1 : 0;  
                    await ctx.reply(ctx.t("profile-message-send-error", {
                            "has-profile": hasProfile,
                            "contact": profile ? profile.displayContact(): ""
                    }), {parse_mode: "HTML"});
                }
                return {updateMessage: action};
            } else {
                await conversation.log("Sending Message canceled");
            }
        } else {
            // Handle the case where the choice is invalid
            await conversation.error("displayProfile: Choice is invalid : ", action);
            if (message) {
                await ctx.api.deleteMessage(ctx.chat!.id, message.message_id);
            }
        }
    }
}
function profileCard (ctx: CustomContext, title: string,
    p: Profile): string {

    const ageText: string = p ? p.baseProfile.getAge() ? ctx.t('age-text', {"age": p.baseProfile.getAge()!}) : '' : '';

    return ctx.t('profile-view', {
        "title": title,
        "gender": p.getBaseProfile().gender,
        "age": ageText,
        "membership": p.getMembershipDuration(ctx),
        "nb-trips-as-driver": p.getNbTripsAsDriver() !== undefined ? p.getNbTripsAsDriver()! : 0,
        "nb-trips-as-passenger": p.getNbTripsAsPassenger()  !== undefined ? p.getNbTripsAsPassenger()! : 0,
        "bio": p.getBio() || '',
        "contact": p.displayContact()
        });
}
