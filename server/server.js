const OpenAI = require("openai")
require('dotenv').config();

const express = require('express')
const app = express()

const cors = require('cors')
const corsOptions = {
    origin: ["http://localhost:5173"]
}

app.use(cors(corsOptions))

const openai = new OpenAI();

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
            model: "gpt-4.1",
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

app.listen(8080, () => {
    console.log("Backend server set up on port 8080")
})