import { type ISessionData } from './sessionData.ts'
import type { Context, SessionFlavor } from 'grammyjs'
import { Conversation, ConversationFlavor } from "grammyConversations";
import { I18nFlavor } from "i18n"

type CustomContext =
        Context 
        & ConversationFlavor<Context>  // Inherit from Context
        & SessionFlavor<ISessionData>
        & I18nFlavor;

type MyConversation = Conversation<Context>;

export type { CustomContext, MyConversation }