const express = require("express");
const cors = require("cors");

// Load local .env only in development (Vercel provides env vars in production)
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
  } catch (_) {}
}

// Use global fetch when available (Node 18+ / Vercel). Fall back to dynamic import of node-fetch for older Node.
let fetchFn;
if (typeof fetch !== "undefined") {
  fetchFn = fetch.bind(globalThis);
} else {
  fetchFn = (...args) => import("node-fetch").then((m) => m.default(...args));
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/api/news", async (req, res) => {
  const { country = "us", category = "general" } = req.query || {};

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NEWS_API_KEY is not configured" });
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(
      country
    )}&category=${encodeURIComponent(category)}&apiKey=${apiKey}`;
    const response = await fetchFn(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("/api/news error:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Start server when run locally. On Vercel you should use a serverless function (see backend/api/news.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

module.exports = app; // export for tests or serverless adapters
