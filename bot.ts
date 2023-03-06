// Importing the Wechaty npm package
import { WechatyBuilder, Contact, Message, ScanStatus, log } from "wechaty";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import dotenv from "dotenv";
import { onScan, onLogin, onLogout, onMessage } from "./utils";

dotenv.config();
console.log(process.env.OPENAI_API_KEY)


// config openAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

// Initializing the bot
export const bot = WechatyBuilder.build({
    name: 'chatgpt-bot',
    puppet: "wechaty-puppet-wechat4u",
    puppetOptions: {
        uos: true,
    },
})

// Keep the conversation state
export const initState: Array<ChatCompletionRequestMessage> = new Array({ "role": "system", "content": "You are a helpful assistant." })

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))