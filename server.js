import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running successfully!");
});

app.get("/price/:symbol", async (req, res) => {
    const symbol = req.params.symbol;

    try {
        const fetchRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        const data = await fetchRes.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error fetching live data" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
