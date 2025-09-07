const express = require('express')
const app = express()

const cors = require('cors')
const corsOptions = {
    origin: ["http://localhost:5173"]
}

app.use(cors(corsOptions))

app.get("/test", (req, res) => {
    res.json({"test": "data"})
})

app.listen(8080, () => {
    console.log("Backend server set up on port 8080")
})