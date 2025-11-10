// Vercel Serverless Function: GET /api/news
// This function expects environment variable NEWS_API_KEY to be set in Vercel dashboard.

module.exports = async (req, res) => {
  const { country = 'us', category = 'general' } = req.query || {};

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NEWS_API_KEY is not configured' });
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}&apiKey=${apiKey}`;
    // Vercel / Node 18+ provides global fetch
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('api/news error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to fetch news', details: err?.message });
  }
};
