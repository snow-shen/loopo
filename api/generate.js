// Phase-2 stub: LLM-generated Strudel beats.
// Contract: POST /api/generate { prompt: "chill lo-fi" } -> { code: "..." }
// Returns 501 until wired up so the shape is visible to the frontend.
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }
  return res.status(501).json({
    error: 'not implemented',
    note: 'future LLM strudel generator lives here'
  });
}
