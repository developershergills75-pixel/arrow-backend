import express from "express";
import fetch from "node-fetch";
import NodeCache from "node-cache";

const app = express();
const cache = new NodeCache({ stdTTL: 60 });

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.send("ArrowProxy Backend Running");
});

app.get("/price", async (req, res) => {
  const symbol = (req.query.symbol || "").trim();
  if (!symbol) {
    return res.status(400).json({ error: "Symbol required" });
  }

  const cacheKey = `price_${symbol.toUpperCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ symbol, price: cached, cached: true });
  }

  let price = null;

  try {
    // Example for Metals API (gold) if symbol is XAUUSD
    if (symbol.toUpperCase() === "XAUUSD") {
      const m = await (await fetch(
        `https://metals-api.com/api/latest?access_key=${process.env.METALS_KEY}&base=USD&symbols=XAU`
      )).json();
      price = m?.rates?.XAU || null;
    }

    // If still no price, try Twelve Data
    if (price === null) {
      const t = await (await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_KEY}`
      )).json();
      price = t?.price || null;
    }

    // If still null, fallback to Alpha Vantage
    if (price === null) {
      const a = await (await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_KEY}`
      )).json();
      price = a?.["Global Quote"]?.["05. price"] || null;
    }

    if (price === null) {
      return res.status(500).json({ error: "Unable to fetch price" });
    }

    cache.set(cacheKey, price);
    return res.json({ symbol, price, cached: false });

  } catch (err) {
    return res.status(500).json({ error: "Backend error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
