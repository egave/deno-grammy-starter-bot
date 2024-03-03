import { bot } from "../bot.ts";
import { computeProfileStatistics } from '../helpers/statistics.ts'

const BOT_ADMIN: number[] = Deno.env.get("BOT_ADMIN")?
                            Deno.env.get("BOT_ADMIN")!.split(",").map(Number):
                            [];

async function doStat(): Promise<string> {
    console.log("Stat process started.");

    const msgForProfiles: string = await computeProfileStatistics();

    BOT_ADMIN.forEach(async (adminId: number) => {
        // Send Stat message for each adminId
        await bot.api.sendMessage(adminId, msgForProfiles,
            { parse_mode: "HTML" });
    });

    return "Stat process completed.";
}

export default doStat;