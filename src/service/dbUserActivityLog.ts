import kv from '../db/db.ts'
import { ulid, decodeTime } from 'ulid'
import { DEFAULTS, KVKeyNames } from '../config.ts'
import { UserActivityLog } from '../models/userActivityLog.ts'

interface ActionTimestamp {
    epochMs: number; // Epoch timestamp in milliseconds
    isoString: string; // ISO 8601 formatted date-time string
}

function generateActionTimestamp(ulid: string): ActionTimestamp {
    const timestamp = decodeTime(ulid);
    return { 
        epochMs: timestamp, 
        isoString: new Date(timestamp).toISOString().split('T')[0]
    };
}

export async function logUserActivity(
    activityLog: UserActivityLog): Promise<void> {
    // Validate required fields
    if (!activityLog || !activityLog.action || activityLog.userId === undefined) {
        throw new Error("Missing required fields for logging action.");
    }    
    
    const expireIn = DEFAULTS.KV.EXPIRE_IN;
    // Generate timestamp and action log details
    const uniqueIdentifier = ulid();
    const actionTimestamp = generateActionTimestamp(uniqueIdentifier);
    const logEntry = { ...actionTimestamp, ...activityLog };

    // Generate date string (yyyymmdd format)
    const yyyy = actionTimestamp.isoString.split('-')[0];
    const yyyymm = actionTimestamp.isoString.replace(/-/g, '').slice(0, 6);
    const yyyymmdd = actionTimestamp.isoString.replace(/-/g, '');
    
    const actionsLogKey = [KVKeyNames.LOGS, yyyymmdd, uniqueIdentifier];
    const actionsByUserIdLogKey = [KVKeyNames.LOGS_BY_USER, activityLog.userId, yyyymmdd, uniqueIdentifier];
    
    const errorActionsLogKey = [KVKeyNames.ERROR_LOGS, yyyymmdd, uniqueIdentifier];
    const errorActionsByUserIdLogKey = [KVKeyNames.ERROR_LOGS_BY_USER, activityLog.userId, yyyymmdd, uniqueIdentifier];

    // Increment action counters
    // const globalStatsKey = [KVKeyNames.STATS, "action", activityLog.action];
    // const userStatsKey = [KVKeyNames.STATS, "user", userId, "action", activityLog.action];
    const actionStatsPartialKey = [KVKeyNames.STATS, KVKeyNames.L2_ACTION, activityLog.action.replace(/_/g, '')];
    const errorStatsPartialKey = [KVKeyNames.STATS, KVKeyNames.L2_ERROR, activityLog.action.replace(/_/g, '')];
    // const userStatsPerDayKey = [KVKeyNames.STATS, "user", userId, "action", yyyymmdd, activityLog.action];
    //const actionStatsPerMonthKey = [KVKeyNames.STATS, "action", activityLog.action, yyyymm];
    // const userStatsPerMonthKey = [KVKeyNames.STATS, "user", userId, "action", yyyymm, activityLog.action];

    if (!activityLog.error) {
        // Perform atomic database operations
        try {
            const result = await kv.atomic()
                .set(actionsLogKey, logEntry, { expireIn })
                .set(actionsByUserIdLogKey, logEntry, { expireIn })
                
                // Increment global counters
                // .sum(globalStatsKey, 1n) 
                .sum([...actionStatsPartialKey, yyyymmdd], 1n)
                .sum([...actionStatsPartialKey, yyyymm], 1n)
                .sum([...actionStatsPartialKey, yyyy], 1n)
                //.sum(actionStatsPerMonthKey, 1n)
                
                // Increment user-specific counters
                // .sum(userStatsKey, 1n)
                // .sum(userStatsPerDayKey, 1n)
                // .sum(userStatsPerMonthKey, 1n)
                .commit();
            if (!result.ok) {
                console.error("Transaction failed in logUserActivity:", result);
                throw new Error("Failed to log activity to database.");
            }
        } catch (error) {
            console.error("Failed to log user action:", error);
            throw error; // Re-throw the error to handle it upstream if needed
        }
    } else {
        // Perform atomic database operations
        try {
            const result = await kv.atomic()
                .set(actionsLogKey, logEntry, { expireIn })
                .set(actionsByUserIdLogKey, logEntry, { expireIn })
                .set(errorActionsLogKey, logEntry, { expireIn })
                .set(errorActionsByUserIdLogKey, logEntry, { expireIn })
                // Increment global error counters
                .sum([...actionStatsPartialKey, yyyymmdd], 1n)
                .sum([...actionStatsPartialKey, yyyymm], 1n)
                .sum([...actionStatsPartialKey, yyyy], 1n)
                .sum([...errorStatsPartialKey, yyyymmdd], 1n)
                .sum([...errorStatsPartialKey, yyyymm], 1n)
                .sum([...errorStatsPartialKey, yyyy], 1n)
                .commit();
            if (!result.ok) {
                console.error("Transaction failed in logUserActivity:", result);
                throw new Error("Failed to log activity to database.");
            }
        } catch (error) {
            console.error("Failed to log user error:", error);
            throw error; // Re-throw the error to handle it upstream if needed
        }
    }
}