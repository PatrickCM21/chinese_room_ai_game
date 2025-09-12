const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://chinese-room-ai-game-client-707hl91xp.vercel.app",
    "https://chinese-room-ai-game-client.vercel.app"
];

export function applyCors(req, res) {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin"); // important for caches
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return true; // handled
    }
    return false;
}