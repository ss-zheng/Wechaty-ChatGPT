import { Client } from "whatsapp-web.js";
import qrTerm from "qrcode-terminal";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

const MEMORY_LIMIT = 50; // max memory
const initState: Array<ChatCompletionRequestMessage> = new Array({ "role": "system", "content": "You are a helpful assistant." })
let conversation: Array<ChatCompletionRequestMessage> = new Array();
conversation.forEach(val => initState.push(Object.assign({}, val)));

// config openAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

const client = new Client({
  puppeteer: {
    headless: true,
		args: [
      '--no-sandbox',
    ],
	}
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrTerm.generate(qr, { small: true })
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

function sessionReset() {
  conversation = new Array();
  conversation.forEach(val => initState.push(Object.assign({}, val)));
}

client.on('message', async msg => {
  console.log(msg.body);
  if (msg.body == '!ping') {
    msg.reply('pong');
  }

  if (msg.body.startsWith("/retry")) {
    conversation.pop(); // remove last reply
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: conversation,
    });

    try {
      const replyContent = response.data.choices[0].message!.content!
      client.sendMessage(msg.from, replyContent);

      // record reply
      const reply: ChatCompletionRequestMessage = { "role": "assistant", "content": replyContent };
      conversation.push(reply);
    } catch (e) {
      console.error(e);
    }
    return
  }

  // reset session when /new
  if (msg.body.startsWith("/new")) {
    sessionReset()
    client.sendMessage(msg.from, "New session started!")
    return
  }
  
  // reply help
  if (msg.body.startsWith("/help")) {
    const helpMenu = `
*Examples*
* Explain quantum computing in simple terms
* Got any creative ideas for a 10 year old’s birthday?
* How do I make an HTTP request in Javascript?

*Capabilities*
* Remembers what user said earlier in the conversation
* Allows user to provide follow-up corrections
* Trained to decline inappropriate requests

*Limitations*
* May occasionally generate incorrect information
* May occasionally produce harmful instructions or biased content
* Limited knowledge of world and events after 2021

*Slash Commands*
* _/new_ : Starts a new session
* _/retry_ : Regenerate last bot answer
* _/help_ : Show help
    `
    client.sendMessage(msg.from, helpMenu);
    return
  }
  
  // return text if no slash command is specified
  if (conversation.length === MEMORY_LIMIT) {
    // reset to initial state when reach the memory limit
    sessionReset()
  }
  conversation.push({ "role": "user", "content": msg.body })
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: conversation,
  });

  try {
    const replyContent = response.data.choices[0].message!.content!
    client.sendMessage(msg.from, replyContent);

    // record reply
    const reply: ChatCompletionRequestMessage = { "role": "assistant", "content": replyContent };
    conversation.push(reply);
  } catch (e) {
    console.error(e);
  }
});

client.initialize();
