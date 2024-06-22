import { type ISessionData } from './sessionData.ts'
import type { Context, SessionFlavor } from 'grammyjs'
import { ConversationFlavor } from "grammyConversations";
import { I18nFlavor } from "i18n"

type CustomContext = 
    Context 
    & ConversationFlavor
    & SessionFlavor<ISessionData>
    & I18nFlavor;

export type { CustomContext }