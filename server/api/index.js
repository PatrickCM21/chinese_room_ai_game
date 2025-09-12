import { applyCors } from "./_cors.js";

export default async function handler(req, res) {
    if (applyCors(req, res)) return;
    res.json({"data": "server is running"})
}

