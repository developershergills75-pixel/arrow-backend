import express from "express";
import fetch from "node-fetch";
import NodeCache from "node-cache";

const app = express();
const cache = new NodeCache({ stdTTL: 10 });

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("ArrowProxy Backend Running");
});

// Universal API route
app.get("/price", async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) return res.json({ error: "Symbol required" });

  const cacheKey = `price_${symbol}`;
  const cachedPrice = cache.get(cacheKey);

  if (cachedPrice) return res.json({ symbol, price: cachedPrice, cache: true });

  try {
    let price = null;

    // 1. MetalsAPI — XAUUSD / GOLD
    if (symbol === "XAUUSD") {
      const m = await (await fetch(
        `https://metals-api.com/api/latest?access_key=${process.env.METALS_KEY}&base=USD&symbols=XAU`
      )).json();

      price = m?.rates?.XAU ? (1 / m.rates.XAU) : null;
    }

    // 2. Alpha Vantage — Forex + Indices
    if (!price) {
      const a = await (await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_KEY}`
      )).json();

      price = a?.["Global Quote"]?.["05. price"] || null;
    }

    // 3. Twelve Data — Crypto + Forex
    if (!price) {
      const t = await (await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_KEY}`
      )).json();

      price = t?.price || null;
    }

    if (!price) return res.json({ error: "No price available" });

    cache.set(cacheKey, price);
    return res.json({ symbol, price, cache: false });

  } catch (err) {
    return res.json({ error: "Backend Error", details: err });
  }
});

app.listen(PORT, () => console.log("Server running on " + PORT));
