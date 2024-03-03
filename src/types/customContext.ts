import { type ISessionData } from './sessionData.ts'
import type { Context, SessionFlavor } from 'npm:grammy'
import { type FluentContextFlavor } from "npm:@grammyjs/fluent";
import { type ConversationFlavor } from "npm:@grammyjs/conversations";

type CustomContext = 
    Context 
    & ConversationFlavor
    & FluentContextFlavor 
    & SessionFlavor<ISessionData>;

export type { CustomContext }