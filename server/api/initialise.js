const OpenAI = require("openai")
const openai = new OpenAI();
require('dotenv').config();
import { applyCors } from "./_cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).end()
    const symbol = req.query.symbol
    const system = `You are a JSON generator. Return ONLY JSON that matches the schema. 
    - Use ${symbol} characters.
    - Rules' order and answer must be syntactically valid short phrases/questions.
    - Only use characters that appear in Dictionary.
    - No extra keys, no comments.`;

    const user = `Provide me with a JSON object with two keys: "Dictionary" and "Rules".
    - Dictionary: up to 50 entries, each with unique id and a single-character "character" (${symbol}).
    - Rules: up to 20 entries. Each has unique id, "order" (a question, ≤ 8 chars) and "answer" (≤ 8 chars).
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
                            maxItems: 50,
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
                            maxItems: 20,
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
    
}