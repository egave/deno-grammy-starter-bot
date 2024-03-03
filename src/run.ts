require('dotenv/config')
import { bot } from './bot.ts'

bot.catch(error => console.log("Catched error: "+error));
bot.start()
