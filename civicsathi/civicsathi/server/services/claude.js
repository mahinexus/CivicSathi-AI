import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const langName = (l) => (l === 'hi' ? 'Hindi (Devanagari script)' : 'English');

function client() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const e = new Error('Anthropic API key is not configured on the server.');
    e.status = 503;
    throw e;
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const BASE = `You are CivicSathi AI, a helpful guide to Indian government schemes.
Use simple, short sentences. Only state facts you are confident about; if unsure, say so and point to the official website.
Never ask for Aadhaar numbers, OTPs or passwords. Do not promise approval.`;

async function ask({ system, messages, max = 900 }) {
  const r = await client().messages.create({ model: MODEL, max_tokens: max, system, messages });
  return r.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}

export async function chat({ message, history = [], lang, schemes }) {
  const context = schemes.map((s) => `- ${s.name} (${s.category}): ${s.description} Documents: ${s.documents.join(', ')}. Official: ${s.officialUrl}`).join('\n');
  const past = history.slice(-10).map((h) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: String(h.text).slice(0, 800) }));
  while (past.length && past[0].role !== 'user') past.shift();
  // Claude requires alternating roles; drop consecutive duplicates
  const msgs = past.filter((m, i) => i === 0 || m.role !== past[i - 1].role);
  if (msgs.length && msgs[msgs.length - 1].role === 'user') msgs.pop();
  msgs.push({ role: 'user', content: message });
  return ask({ system: `${BASE}\nReply in ${langName(lang)}.\nSchemes in our database:\n${context}`, messages: msgs });
}

export const guidance = ({ scheme, lang }) => ask({
  system: `${BASE}\nReply in ${langName(lang)}.`,
  messages: [{ role: 'user', content: `Give a numbered, step-by-step application guide (max 8 steps) for "${scheme.name}". Required documents: ${scheme.documents.join(', ')}. Official site: ${scheme.officialUrl}. End with one tip to avoid rejection.` }],
});

export const explainRejection = ({ scheme, reason, lang }) => ask({
  system: `${BASE}\nReply in ${langName(lang)}.`,
  messages: [{ role: 'user', content: `An application for "${scheme.name}" was rejected. Reason given: "${reason}". Explain in plain words what it means, then list 3 concrete next steps to fix it or appeal.` }],
});

export async function scanDocument({ buffer, mimeType, expected }) {
  const data = buffer.toString('base64');
  const file = mimeType === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: mimeType, data } }
    : { type: 'image', source: { type: 'base64', media_type: mimeType, data } };
  const text = await ask({
    system: BASE,
    max: 700,
    messages: [{ role: 'user', content: [file, { type: 'text', text: `Read this document. Reply with JSON only, no other text:
{"documentType": string, "extractedText": string (max 400 chars), "fields": {"name": string|null, "dateOfBirth": string|null, "idNumberLast4": string|null}, "quality": "good"|"poor", "matchesExpected": boolean, "issues": string[]}
Expected document type: "${expected || 'unknown'}". Never output full ID numbers; only the last 4 digits.` }] }],
  });
  try { return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)); }
  catch { return { documentType: 'unknown', extractedText: text.slice(0, 400), quality: 'poor', matchesExpected: false, issues: ['Could not parse the result'] }; }
}
