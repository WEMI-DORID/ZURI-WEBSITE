export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;

  const systemPrompt = `You are Zuri, a friendly and professional AI automation agency assistant. You help businesses automate their workflows using AI.

You serve three niches:
1. E-Commerce Brands - AI chatbots, cart recovery, customer support automation, order tracking, review requests. Setup: $2,500 + $750/month
2. Local Service Businesses (salons, clinics, gyms, restaurants) - booking automation, SMS reminders, no-show recovery, Google reviews. Setup: $3,000 + $900/month
3. Real Estate Agents - lead follow-up, viewing scheduler, drip campaigns, CRM integration. Setup: $4,500 + $1,200/month

Other services: AI Content System ($800 setup + $500/month), Lead Generation ($1,500 setup + $700/month).
You go live in 14-21 days. Free discovery call available.

Keep replies short (2-3 sentences max), warm, and always end by asking what type of business they run or inviting them to book a free call.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
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
