const OpenAI = require("openai")
const openai = new OpenAI();
require('dotenv').config();
import { applyCors } from "./_cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).end()
    const { data } = req.body

    const system = `You are an assistant to years 7-10 students trying to understand how AI and computers work, particularly whether AI can 'understand' what it is doing through John Searle's Chinese Room Argument. Only respond with information related to this argument. You will be given a piece of information the user is struggling to understand, provide a beginner-friendly explanation for it. 
    - Do not use more than 150 words. `;

    const user = `Provide me with a information to help me understand this passage:
    ${data}
    `
    try {
        const response = await openai.responses.create({
            model: "gpt-5-mini",
            input: [
            { role: "system", content: system },
            { role: "user", content: user }
            ]
        });
    
        res.json(response.output_text)
    } catch (e) {
        console.log(e)
        res.status(400).json({error: "API_NO_RESPONSE", message: "Could not get ChatGPT data"})
    }
}
