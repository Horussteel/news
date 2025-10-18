import { Readable } from 'stream';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch stream from source' });
    }

    // Set the appropriate headers for streaming audio
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.setHeader('Cache-Control', 'no-cache');

    // Convert the web stream to a Node.js stream and pipe it
    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body);
      nodeStream.pipe(res);
    } else {
      res.status(500).json({ error: 'Response body is empty' });
    }

  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
