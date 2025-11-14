import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ========================
// GLOBAL CACHE SYSTEM
// ========================
let cache = {};
const CACHE_TIME = 5000; // 5 seconds — safe, avoids rate limits

async function cachedFetch(key, fetchFn) {
    const now = Date.now();

    // RETURN FROM CACHE
    if (cache[key] && now - cache[key].time < CACHE_TIME) {
        return cache[key].data;
    }

    try {
        const fresh = await fetchFn();
        cache[key] = { data: fresh, time: now };
        return fresh;
    } catch (err) {
        console.error("API Error:", err);
        return cache[key]?.data || { error: "Service temporarily unavailable" };
    }
}

// ==========================
// ROOT CHECK
// ==========================
app.get("/", (req, res) => {
    res.send("Arrow Backend Running Successfully ✔️");
});

// ==========================
// CRYPTO: Binance Free Web API (No key needed)
// ==========================
app.get("/crypto/:symbol", async (req, res) => {
    const symbol = req.params.symbol.toUpperCase() + "USDT";

    const data = await cachedFetch(`crypto_${symbol}`, async () => {
        const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
        const response = await fetch(url);
        return await response.json();
    });

    res.json(data);
});

// ==========================
// FOREX: TwelveData (You provided key)
// ==========================
const TWELVE_KEY = "cee241dad68f4eaca789faf0c0b59b39";

app.get("/forex/:pair", async (req, res) => {
    const pair = req.params.pair.toUpperCase();

    const data = await cachedFetch(`forex_${pair}`, async () => {
        const url = `https://api.twelvedata.com/price?symbol=${pair}&apikey=${TWELVE_KEY}`;
        const response = await fetch(url);
        return await response.json();
    });

    res.json(data);
});

// ==========================
// GOLD / METALS: Metals API
// ==========================
const METALS_KEY = "l0q34s9bm33e87c62lp8wzlnd8v78vzn20nlgek1cis2w5da04n237btojxw";

app.get("/gold", async (req, res) => {
    const data = await cachedFetch("gold_price", async () => {
        const url = `https://metals-api.com/api/latest?access_key=${METALS_KEY}&base=XAU&symbols=USD`;
        const response = await fetch(url);
        return await response.json();
    });

    res.json(data);
});

// ==========================
// STOCKS / INDICES: Alpha Vantage
// ==========================
const ALPHA_KEY = "XCGXY567WLNDALX3";

app.get("/stock/:symbol", async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();

    const data = await cachedFetch(`stock_${symbol}`, async () => {
        const url =
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`;
        const response = await fetch(url);
        return await response.json();
    });

    res.json(data);
});

// ==========================
// SERVER LISTEN
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
