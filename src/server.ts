import { serve } from "http-server";
import { webhookCallback } from "npm:grammy";
import { bot } from "./bot.ts";
import doStat from './tasks/doStat.ts'


const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req: Request) => {
  if (req.method == "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) == bot.token) {
      try {
        console.debug("Received a new message !");
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});

Deno.cron("doJob - Run every saturday at 19", "0 19 * * 6", () => {
     async function main() {
        console.debug('Executing CRON doJob()...')
        const result:string = await doStat();
        
        return result
    }
    main()
});