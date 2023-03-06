// Importing the Wechaty npm package
import { WechatyBuilder, Contact, Message, ScanStatus, log } from "wechaty";
import { Configuration, OpenAIApi } from "openai";
import markdownIt from 'markdown-it';
import { FileBox } from "file-box";
import qrTerm from "qrcode-terminal";
import dotenv from "dotenv";
import nodeHtmlToImage from 'node-html-to-image';

dotenv.config();
console.log(process.env.OPENAI_API_KEY)

// config openAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


// Initializing the bot
const bot = WechatyBuilder.build({
    name: 'chatgpt-bot',
    puppet: "wechaty-puppet-wechat4u",
    puppetOptions: {
        uos: true,
    },
})

function convertMarkdownToHtml(markdown: string): string {
    const md = new markdownIt();
    return md.render(markdown);
}

function onScan (qrcode: string, status: ScanStatus) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
      qrTerm.generate(qrcode, { small: true })  // show qrcode on console
  
      const qrcodeImageUrl = [
        'https://wechaty.js.org/qrcode/',
        encodeURIComponent(qrcode),
      ].join('')
  
      log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
    } else {
      log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
    }
  }
  
  function onLogin (user: Contact) {
    log.info('StarterBot', '%s login', user)
  }
  
  function onLogout (user: Contact) {
    log.info('StarterBot', '%s logout', user)
  }
  
  async function onMessage (msg: Message) {
    log.info('StarterBot', msg.toString())
    
    const contact = msg.talker();
    const content = msg.text();
    const isText = msg.type() === bot.Message.Type.Text;
    if (msg.self() || !isText) { // msg.self() check if the message is sent from the bot itself
        return;
    }
    if (content === 'ding') {
        await contact.say('dong');
    } 
    // return text
    if (content.startsWith("/t ")) {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": content.replace("/t", "")}
            ]
        });
                
        try {
            await contact.say(response.data.choices[0].message!.content!);
        } catch (e) {
            console.error(e);
        }
    }
    // return image
    if (content.startsWith("/i ")) {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": content.replace("/i", "")}
            ]
        });
        
        try {
            const html = convertMarkdownToHtml(response.data.choices[0].message!.content!);
            await nodeHtmlToImage({
              output: './output.png',
              html: html
            })

            log.info('The image was created successfully!')
            const fileBox = FileBox.fromFile("./output.png");
            await contact.say(fileBox)
        } catch (e) {
            console.error(e)
        }
    }
  }
  
bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))