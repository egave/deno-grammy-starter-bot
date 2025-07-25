import kv from '../db/db.ts'
import type { CustomContext } from '../models/customContext.ts'
import { DEFAULTS, KVKeyNames, MAX_MESSAGE_LENGTH } from '../config.ts'

/**
 * Deletes all entries in the database.
 *
 * This function retrieves all entries from the database using the `kv.list()` method with an empty prefix.
 * It then iterates over each entry, extracts the key, and deletes the entry from the database using `kv.delete()`.
 *
 * @remarks
 * This function is useful for cleaning up the database or resetting its state.
 *
 * @returns {Promise<void>} A promise that resolves when all entries have been deleted.
 */
export async function deleteAllRecords(): Promise<number> {
    console.debug("Delete All records in the Database.");
    let nbr = 0;
    const allRecords = await Array.fromAsync(kv.list({ prefix: [] }));
    for (const record of allRecords) {
        nbr++;
        const typedRecord = record as { key: (string | number)[] }; // Explicit cast
        console.debug(typedRecord.key);
        await kv.delete(typedRecord.key);
    }
    console.debug(`Deleted ${nbr} records.`);
    return nbr;
}
/**
 * Deletes database entries based on a given key prefix.
 *
 * This function retrieves all entries from the database using the `kv.list()` method with the provided key prefix.
 * It then iterates over each entry, extracts the key, and deletes the entry from the database using `kv.delete()`.
 *
 * @remarks
 * This function is useful for cleaning up specific entries in the database based on a given key prefix.
 *
 * @param {(string | number)[]} key - The key prefix for the entries to be deleted.
 * @returns {Promise<void>} A promise that resolves when all entries with the given key prefix have been deleted.
 *
 * @example
 * ```typescript
 * await deleteRecords(["user", "123"]);
 * // Deletes all entries in the database with keys starting with ["user", "123"]
 * ```
 */
export async function deleteRecords(key: (string | number)[]): Promise<number> {
    console.debug("Delete records in the Database for Key Prefix:", key);
    let nbr = 0;
    const allRecords = await Array.fromAsync(kv.list({ prefix: key }));
    for (const record of allRecords) {
        nbr++;
        const typedRecord = record as { key: (string | number)[] }; // Explicit cast
        console.debug(typedRecord.key);
        await kv.delete(typedRecord.key);
    }
    if (allRecords.length === 0) {
        nbr++;
        await kv.delete(key);
    }
    console.debug(`Deleted ${nbr} records.`);
    return nbr;
}


/**
 * Show records in the database for a given key prefix.
 *
 * This function retrieves all entries from the database using the `kv.list()` method with the provided key prefix.
 * It then iterates over each entry, constructs a message with the entry's key, and sends it to the Telegram bot using the `ctx.reply()` method.
 * If no entries are found for the given key prefix, the function checks if the key refers to a single entry.
 * If a single entry is found, it constructs a message with the entry's key and value and sends it to the Telegram bot.
 * If no entries are found, it sends a message indicating that no entries were found in the database.
 *
 * @param {CustomContext} ctx - The custom context object containing the Telegram bot's context.
 * @param {(string | number)[]} key - The key prefix for the entries to be logged.
 * @returns {Promise<void>} A promise that resolves when all entries for the given key prefix have been logged.
 *
 * @example
 * ```typescript
 * await showRecords(ctx, ["user", "123"]);
 * // Logs all entries in the database with keys starting with ["user", "123"] to the Telegram bot
 * ```
 */
export async function showRecords(ctx: CustomContext, key: (string | number)[], showValues?: boolean): Promise<void> {
    console.debug("Log records in the Database for Key Prefix:", key);

    if (key.length === 0) {
        console.debug("Key is empty. Retrieving distinct level 1 keys.");

        const iter = kv.list<string>({ prefix: [] }); // List all keys
        const distinctKeys = new Set<string>();

        for await (const res of iter) {
            if (res.key.length > 0) {
                distinctKeys.add(res.key[0].toString());
            }
        }

        if (distinctKeys.size === 0) {
            console.debug("No distinct keys found in the database.");
            await ctx.reply("No entries found in the database.", { parse_mode: "HTML" });
            return;
        }

        const distinctKeysMsg = `<b>Distinct level 1 keys in the database:</b>\n` +
            Array.from(distinctKeys).map(key => `<b>/kv_${key}</b>`).join("\n");

        await ctx.reply(distinctKeysMsg, { parse_mode: "HTML" });
        return;
    }
    
    const iter = kv.list<string>({ prefix: key });

    let nbr = 0;
    let entriesListMsg = `<b>Entries in the database for key: ${key}</b>\n`;
    if (showValues) {
        for await (const res of iter) {
            nbr += 1;
            entriesListMsg += `<b>/kv_${res.key.join('_')}</b>\n`;

            const val = await kv.get(res.key);
            if (val.value) {
                const valueStr = JSON.stringify(val.value, (key, val) =>
                    typeof val === "bigint" ? val.toString() : val,
                    2 // Indentation for JSON formatting
                );
                entriesListMsg += `${valueStr}\n`;
            }
        }
    } else {
        let entriesArray: string[] = [];
        const uniqueEntries = new Set<string>(); // Pour suivre les entrées uniques

        for await (const res of iter) {
            nbr += 1;
            let entry = "";
            for (let i = 0; i < key.length; i++) {
                entry += `${res.key[i]}_`;
            }
            entry += `${res.key[key.length]}`;
            
            // Ajoute seulement si l'entrée n'existe pas déjà
            if (!uniqueEntries.has(entry)) {
                uniqueEntries.add(entry);
                entriesArray.push(entry);
            }
        }

        for (const entry of entriesArray) {
            entriesListMsg += `<b>/kv_${entry}</b>\n`;
        }
    }
    // If no entries were found, check if the key refers to a single entry
    if (nbr === 0) {
        const res = await kv.get(key);
        console.debug(res);
        if (!res.value) {
            console.debug("No entries found in the database.");
            await ctx.reply("No entries found in the database",
                { parse_mode: "HTML" });
            return;
        } else {
            //entriesListMsg += `${res.key}: ${JSON.stringify(res.value, null, 2)}\n`;
            // Handle BigInt serialization for single entries
            const valueStr = JSON.stringify(res.value, (key, value) =>
                typeof value === "bigint" ? value.toString() : value,
                2 // Indentation for JSON formatting
            );
            entriesListMsg += `<b>Key:</b> ${res.key.join(' ')}\n<b>Value:</b> ${valueStr}\n`;
        }
    }
    
    // Create chunks of the message
    const messageChunks = splitMessageByLines(entriesListMsg, MAX_MESSAGE_LENGTH);

    // Send each chunk
    for (const chunk of messageChunks) {
        await ctx.reply(chunk, { parse_mode: "HTML" });
    }
}

// Function to split message into line-aware chunks
function splitMessageByLines(message: string, maxLength: number): string[] {
    const lines = message.split("\n");
    const chunks: string[] = [];
    let currentChunk = "";

    for (const line of lines) {
        if ((currentChunk + line + "\n").length > maxLength) {
            chunks.push(currentChunk.trim()); // Add the current chunk
            currentChunk = ""; // Reset chunk
        }
        currentChunk += line + "\n"; // Add line to the current chunk
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim()); // Push remaining content
    }

    return chunks;
}

/**
 * Logs all "session" data entries from the database.
 *
 * This function calls the `showRecords` function with the key prefix `["sessions"]` to retrieve and log all session data entries in the database.
 *
 * @remarks
 * This function is useful for debugging or displaying all "session" data entries in the database.
 *
 * @param {CustomContext} ctx - The custom context object containing the Telegram bot's context.
 * @returns {Promise<void>} A promise that resolves when all "session" data entries have been logged.
 *
 * @example
 * ```typescript
 * await showSessions(ctx);
 * // Logs all "session" data entries in the database to the Telegram bot
 * ```
 */
export async function showSessions(ctx: CustomContext): Promise<void> {
    await showRecords(ctx, [KVKeyNames.SESSIONS]);
}

export async function showSession(ctx: CustomContext, _userId: number) {
    await showRecords(ctx, [KVKeyNames.SESSIONS, _userId]);
}

// Function to delete a session from the database
export async function deleteSession(ctx: CustomContext, _userId: number) {
    await kv.delete([KVKeyNames.SESSIONS, _userId]);

    await ctx.reply("Session deleted!",
    { parse_mode: "HTML" });
}

// Function to migrate a session from the database
export async function migrationSession(ctx: CustomContext, _userId: number) {
    const data = await kv.get([KVKeyNames.SESSIONS, _userId]);
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

/**
 * Generates a random delay time between the specified minimum and maximum values.
 * @param {number} min - The minimum delay in milliseconds.
 * @param {number} max - The maximum delay in milliseconds.
 * @returns {number} A random integer between min and max (inclusive).
 */
export function getRandomRetryDelay(min: number = DEFAULTS.KV.MIN_WAIT_RETRY_DELAY,
                                    max: number = DEFAULTS.KV.MAX_WAIT_RETRY_DELAY)
                                    : number {
    // Generate a random decimal number between 0 (inclusive) and 1 (exclusive)
    const randomDecimal = Math.random();

    // Scale the random number to the range [0, (max - min + 1)]
    const scaledRandom = randomDecimal * (max - min + 1);

    // Shift the range to start at `min` and round down to the nearest integer
    return Math.floor(scaledRandom) + min;
}
