import kv from '../db/db.ts'
import type { CustomContext } from '../types/customContext.ts'
import { SessionData } from '../types/sessionData.ts'
import type { Charter } from '../types/charter.ts'
import type { Profile } from '../types/profile.ts'

// Function to list all sessions in the database
export async function logAllSessionsDataFromDatabase(ctx: CustomContext) {
    const iter = kv.list<string>({ prefix: ["sessions"] });

    console.debug(iter);
    
    let nbrSessions = 0;
    let sessionsListMsg = `<b>Sessions in the database:</b>\n`;
    for await (const res of iter) {
        nbrSessions += 1;
        const key0 = res.key[0];
        const userId = res.key[1]; // Extract the user ID from the key
        const value = res.value; // Extract the value from the response
        console.debug("key0: ", key0);
        console.debug("userId: ", userId);
        //console.debug("value: ", value);
        sessionsListMsg += `${key0}, ${userId}\n`;
        // sessionsListMsg += JSON.stringify(value, null, 2) + "\n\n";
    }
    if (nbrSessions === 0) {
        console.debug("No sessions found in the database.");
        await ctx.reply("No sessions found in the database",
            { parse_mode: "HTML" });
        return;
    }

    await ctx.reply(sessionsListMsg,
                            { parse_mode: "HTML" });
}

export async function logSessionDataFromDatabase(ctx: CustomContext, _userId: string) {
    const data = await kv.get(["sessions", _userId]);
    console.debug("data: ", JSON.stringify(data.value, null, 2));
    let sessionDataMsg = `<b>Session data for: ${_userId}</b>\n`;
    if (data.value) {
        sessionDataMsg += JSON.stringify(data.value, null, 2);
    }
    else {
        console.debug(`No sessions found in the database for ${_userId}!`);
        await ctx.reply(`No session found in the database for ${_userId}!`,
            { parse_mode: "HTML" });
        return;
    }

    await ctx.reply(sessionDataMsg,
                            { parse_mode: "HTML" });
}

// Function to delete a session from the database
export async function deleteSessionFromDatabase(ctx: CustomContext, _userId: string) {
    await kv.delete(["sessions", _userId]);

    await ctx.reply("Session deleted!",
    { parse_mode: "HTML" });
}

// Function to delete a session from the database
export async function migrationSessionDataInDatabase(ctx: CustomContext, _userId: string) {
    const data = await kv.get(["sessions", _userId]);
    if (data.value) {
        console.debug("Migrating Data...");
        // Do whatever data migration is needed

        // ctx.session.data.signatureDate = undefined;
        // ctx.session.data.baseProfile = undefined;
    }
    else {
        console.debug(`No session found in the database for ${_userId}!`);
        await ctx.reply(`No session found in the database for ${_userId}!`,
            { parse_mode: "HTML" });
        return;
    }

    await ctx.reply(`Data migrated for ${_userId}!`,
    { parse_mode: "HTML" });
}

// Function to delete objects from the database
export async function deleteKeysFromDatabase(ctx: CustomContext, _keys: (string | number)[]) {
    console.debug("Inside deleteKeysFromDatabase");
    let nbrObjects = 0;
    console.debug("Received " + _keys.length + " key(s): ", _keys);
            
    const iter = kv.list<string>({ prefix: _keys });
    
    for await (const res of iter) {
        nbrObjects += 1;
        console.debug("Deleting: ", res.key);
        await kv.delete(res.key);
        console.debug("Deleted: ", res.key);
    }

    if (nbrObjects === 0) {
        console.debug("No values found in the database");
        await ctx.reply("Nothing found in the database ",
                    { parse_mode: "HTML" });
        return;
    }

    await ctx.reply("Deleted " + nbrObjects + " objects.",
                            { parse_mode: "HTML" });
}
