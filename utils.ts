import { Contact, Message, ScanStatus, log } from "wechaty";
import { bot, openai } from "./bot";
import markdownIt from 'markdown-it';
import { FileBox } from "file-box";
import qrTerm from "qrcode-terminal";
import nodeHtmlToImage from 'node-html-to-image';

function convertMarkdownToHtml(markdown: string): string {
    const md = new markdownIt();
    return md.render(markdown);
}

export function onScan (qrcode: string, status: ScanStatus) {
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
  
export function onLogin(user: Contact) {
    log.info('StarterBot', '%s login', user)
}

export function onLogout(user: Contact) {
    log.info('StarterBot', '%s logout', user)
}
  
export async function onMessage(msg: Message) {
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
                { "role": "system", "content": "You are a helpful assistant." },
                { "role": "user", "content": content.replace("/t", "") }
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
                { "role": "system", "content": "You are a helpful assistant." },
                { "role": "user", "content": content.replace("/i", "") }
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