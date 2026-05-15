export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  const KEY = process.env.OPENROUTER_KEY;

  const systemPrompt = `You are Zuri, a friendly AI automation agency assistant. You help businesses understand how AI automation can save them time and money. Keep responses concise and helpful.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'Zuri AI Agency'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.parts[0].text
          }))
        ],
        max_tokens: 200
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    const reply = data.choices?.[0]?.message?.content || "Book a free call and we'll walk you through everything!";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
