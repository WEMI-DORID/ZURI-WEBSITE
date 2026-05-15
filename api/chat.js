export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  const KEY = process.env.OPENROUTER_KEY;

  const systemPrompt = `You are Zuri, a friendly AI automation agency assistant. You help businesses automate with AI. You serve 3 niches: 1) E-Commerce Brands (chatbots, cart recovery - $2,500 setup + $750/month), 2) Local Service Businesses like salons, clinics, gyms (booking automation, SMS reminders - $3,000 setup + $900/month), 3) Real Estate Agents (lead follow-up, viewing scheduler - $4,500 setup + $1,200/month). Other services: AI Content System ($800 + $500/month), Lead Generation ($1,500 + $700/month). Go live in 14-21 days. Free discovery call available. Keep replies short (2-3 sentences), warm, always end by asking what business they run or inviting them to book a free call.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://zuri-website-two.vercel.app',
        'X-Title': 'Zuri AI Agency'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
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
