const OpenAI = require("openai")
require('dotenv').config();

const express = require('express')
const app = express()

const cors = require('cors')
const corsOptions = {
    origin: ["http://localhost:5173"]
}

app.use(express.json())
app.use(cors(corsOptions))

const openai = new OpenAI();

app.get("/", async (req, res) => {
    res.json({"data": "server is running"})
})

app.get("/initialise", async (req, res) => {
    const system = `You are a JSON generator. Return ONLY JSON that matches the schema. 
    - Use Simplified Chinese characters.
    - Rules' order and answer must be syntactically valid short phrases/questions.
    - Only use characters that appear in Dictionary.
    - No extra keys, no comments.`;

    const user = `Provide me with a JSON object with two keys: "Dictionary" and "Rules".
    - Dictionary: up to 100 entries, each with unique id and a single-character "character" (Simplified Chinese).
    - Rules: up to 30 entries. Each has unique id, "order" (a question, ≤ 8 chars) and "answer" (≤ 8 chars).
    - Every character used in any rule must exist in Dictionary.
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
                        required: ["dictionary", "rules"],
                        properties: {
                        dictionary: {
                            type: "array",
                            minItems: 1,
                            maxItems: 100,
                            items: {
                            type: "object",
                            additionalProperties: false,
                            required: ["id", "character"],
                            properties: {
                                id: { type: "string", minLength: 1 },
                                character: { type: "string", minLength: 1, maxLength: 1 }
                            }
                            }
                        },
                        rules: {
                            type: "array",
                            minItems: 1,
                            maxItems: 30,
                            items: {
                            type: "object",
                            additionalProperties: false,
                            required: ["id", "order", "answer"],
                            properties: {
                                id: { type: "string", minLength: 1 },
                                order: { type: "string", minLength: 1, maxLength: 8 },
                                answer: { type: "string", minLength: 1, maxLength: 8 }
                            }
                            }
                        }
                        }
                    }
                }
                }
        });
        const data = JSON.parse(response.output_text)
    
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
    console.log("Backend server set up on port 8080")
})