import kv from '../db/db.ts'
import { UserBotStatusHistory } from '../models/userBotStatus.ts'
import { KVKeyNames } from '../config.ts'


export async function getUserBotStatusHistory(idUser: number): Promise<UserBotStatusHistory | null> {
    const primaryKey = [KVKeyNames.BOT_STATUS, idUser];
    const botStatusHistoryRes = await kv.get<UserBotStatusHistory>(primaryKey);
    return botStatusHistoryRes.value ? UserBotStatusHistory.fromObject(botStatusHistoryRes.value) : null;
}

export async function saveUserBotStatusHistory(idUser: number, botStatusHistory: UserBotStatusHistory): Promise<{ok: boolean}> {
    const primaryKey = [KVKeyNames.BOT_STATUS, idUser]; // Création de la clé primaire du trajet
    const res = await kv.set(primaryKey, botStatusHistory);

    if (!res.ok) {
        console.error("Error when trying to save bot Status: ", res);
        throw new TypeError("Error when trying to save bot Status for user with ID " + idUser);
    }

    return res;
}

export async function isKicked(userId: number): Promise<boolean> {
    // Fetch the user's bot status history from the database
    const userBotStatusHistory = await getUserBotStatusHistory(userId);

    // If no history exists, return false
    if (!userBotStatusHistory) {
        return false;
    }

    // Use the isKicked method to determine the kicked status
    return userBotStatusHistory.isKicked();
}
