import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.OPENAI_API_KEY)

// config openAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function chatGPT() {
    const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Who won the world series in 2020?"},
            {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
            {"role": "user", "content": "Where was it played?"}
        ]
    });
    const replyContent = response.data.choices[0].message!.content!
    return replyContent
}

        
console.log(await chatGPT())
