//import { serve } from "http-server";
import { webhookCallback } from "grammyjs";
import { bot } from "./bot.ts";
import { doDump } from "./db/db_dump.ts";
import doStat from './tasks/doStat.ts'


const handleUpdate = webhookCallback(bot, "std/http");
Deno.serve({ port: 8000 }, async (req: Request) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Vérifie d'abord les requêtes POST pour le webhook Telegram
  if (req.method === "POST" && pathname.slice(1) === bot.token) {
    try {
      console.debug("Received a new message!");
      return await handleUpdate(req);
    } catch (err) {
      console.error("Erreur lors du traitement du message :", err);
      return new Response("Erreur interne", { status: 500 });
    }
  }

  // Ensuite, vérifie les requêtes GET pour le point de terminaison /health
  if (req.method === "GET" && pathname === "/health") {
    const region = Deno.env.get("DENO_REGION") || "Unknown region"; // Fetch the region
    return new Response(`OK from ${region}`, { status: 200 });
  }

  // Réponse par défaut pour les autres cas
  return new Response("Méthode ou chemin non supporté", { status: 405 });
});


Deno.cron("doJob - Run every saturday at 19", "0 19 * * 6", () => {
     async function main() {
        const start = Date.now();
    const result:string = await doStat();
    console.log(`Executed CRON doStat() in ...${Date.now() - start}ms`)
    
    return result
  }
  main()
});

Deno.cron("doDump - Run every hour", "0 1 * * *", () => {
  async function main() {
    const start = Date.now();
    Deno.env.set("MAINTENANCE", "ON");
    await doDump();
    Deno.env.set("MAINTENANCE", "OFF");
    console.log(`Executed CRON doDump() in ...${Date.now() - start}ms`)
  }
  main()
});