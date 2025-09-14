const OpenAI = require("openai")
require('dotenv').config();

const express = require('express')
const app = express()

const cors = require('cors')
const corsOptions = {
    origin: ["http://localhost:5173", "https://chinese-room-ai-game-client.vercel.app"]
}

app.use(express.json())
app.use(cors(corsOptions))

const openai = new OpenAI();

app.get("/", (req, res) => {
    res.json({"data": "server is running"})
})

app.get("/initialise", async (req, res) => {
    console.log("received initialise req")
    const symbol = req.query.symbol
    const system = `You are a JSON generator. Return ONLY JSON that matches the schema. 
    - Use ${symbol} characters.
    - Rules' order and answer must be syntactically valid short phrases/questions.
    - No extra keys, no comments, no punctuation.`;

    const user = `Provide me with a JSON object with two keys: "Dictionary" and "Rules".
    - Rules: 12 entries. Each has unique id number, "order" (a question, between 3 and 8 chars) and "answer" (between 3 and 4 chars). ${symbol === 'Chinese' ? "Do not use 你好吗" : ""}
    Return only JSON.`
    try {
        const response = await openai.responses.create({
            model: "gpt-5-mini",
            input: [
            { role: "system", content: system },
            { role: "user", content: user }
            ],
            text: {
                format: {
                    type: "json_schema",
                    name: "ChineseQAData",
                    strict: true,
                    schema: {
                        type: "object",
                        additionalProperties: false,
                        required: ["rules"],
                        properties: {
                        rules: {
                            type: "array",
                            minItems: 12,
                            maxItems: 12,
                            items: {
                            type: "object",
                            additionalProperties: false,
                            required: ["id", "order", "answer"],
                            properties: {
                                id: { type: "string", minLength: 1 },
                                order: { type: "string", minLength: 3, maxLength: 8 },
                                answer: { type: "string", minLength: 3, maxLength: 4 }
                            }
                            }
                        }
                        }
                    }
                }
                }
        });
        const data = JSON.parse(response.output_text)
        console.log("sent data")
        res.json(data)
    } catch (e) {
        console.log(e)
        res.status(400).json({error: "API_NO_RESPONSE", message: "Could not get ChatGPT data"})
    }
    
})

app.post("/requesthelp", async (req, res) => {
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
})

app.listen(8080, () => {
    console.log(`Server running on port 3000`);
});