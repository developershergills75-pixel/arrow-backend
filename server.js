import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// ---- API KEYS ----
const ALPHA_KEY = "XCGXY567WLNDALX3";
const TWELVE_KEY = "cee241dad68f4eaca789faf0c0b59b39";
const METAL_KEY = "l0q34s9bm33e87c62lp8wzlnd8v78vzn20nlgek1cis2w5da04n237btojxw";

// ---- GLOBAL FETCH (Node 18+) ----
// No need for node-fetch

app.get("/", (req, res) => {
  res.send("Arrow Backend Live");
});


// ----------------------
//  CRYPTO PRICE (FREE)
// ----------------------
app.get("/crypto", async (req, res) => {
  const symbol = req.query.symbol || "BTCUSDT";

  try {
    const r = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    const data = await r.json();
    res.json({
      type: "crypto",
      symbol,
      price: data.price,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------
//  FOREX PRICE (FREE)
// ----------------------
app.get("/forex", async (req, res) => {
  const pair = req.query.pair || "EUR/USD";

  try {
    const r = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${pair.split("/")[0]}&to_currency=${pair.split("/")[1]}&apikey=${ALPHA_KEY}`
    );
    const data = await r.json();

    res.json({
      type: "forex",
      pair,
      price: data["Realtime Currency Exchange Rate"]["5. Exchange Rate"],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------
//  GOLD / XAUUSD (FREE)
// ----------------------
app.get("/gold", async (req, res) => {
  try {
    const r = await fetch(
      `https://metals-api.com/api/latest?access_key=${METAL_KEY}&base=USD&symbols=XAU`
    );
    const data = await r.json();

    res.json({
      type: "gold",
      symbol: "XAUUSD",
      price: Number(1 / data.rates.XAU).toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------
//  STOCK PRICE (FREE)
// ----------------------
app.get("/stock", async (req, res) => {
  const symbol = req.query.symbol || "AAPL";

  try {
    const r = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`
    );
    const data = await r.json();

    res.json({
      type: "stock",
      symbol,
      price: data["Global Quote"]["05. price"],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------
//  INDICES (FREE)
// ----------------------
app.get("/index", async (req, res) => {
  const name = req.query.name || "NIFTY50";

  try {
    const r = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${name}&apikey=${ALPHA_KEY}`
    );
    const data = await r.json();

    res.json({
      type: "index",
      name,
      price: data["Global Quote"]["05. price"],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(10000, () =>
  console.log("Arrow Backend Live on port 10000")
);
