import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const langName = (l) => (l === 'hi' ? 'Hindi (Devanagari script)' : 'English');

function getModel(systemInstruction, json = false) {
  if (!process.env.GEMINI_API_KEY) {
    const e = new Error('Gemini API key is not configured on the server.');
    e.status = 503;
    throw e;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction,
    generationConfig: json ? { responseMimeType: 'application/json' } : undefined,
  });
}

const BASE = `You are CivicSathi AI, a helpful guide to Indian government schemes.
Use simple, short sentences. Only state facts you are confident about; if unsure, say so and point to the official website.
Never ask for Aadhaar numbers, OTPs or passwords. Do not promise approval.`;

export async function chat({ message, history = [], lang, schemes }) {
  const context = schemes.map((s) => `- ${s.name} (${s.category}): ${s.description} Documents: ${s.documents.join(', ')}. Official: ${s.officialUrl}`).join('\n');
  const model = getModel(`${BASE}\nReply in ${langName(lang)}.\nSchemes in our database:\n${context}`);
  const past = history.slice(-10).map((h) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: String(h.text).slice(0, 800) }] }));
  while (past.length && past[0].role !== 'user') past.shift();
  const r = await model.startChat({ history: past }).sendMessage(message);
  return r.response.text();
}

export async function guidance({ scheme, lang }) {
  const model = getModel(`${BASE}\nReply in ${langName(lang)}.`);
  const r = await model.generateContent(
    `Give a numbered, step-by-step application guide (max 8 steps) for "${scheme.name}". Required documents: ${scheme.documents.join(', ')}. Official site: ${scheme.officialUrl}. End with one tip to avoid rejection.`
  );
  return r.response.text();
}

export async function explainRejection({ scheme, reason, lang }) {
  const model = getModel(`${BASE}\nReply in ${langName(lang)}.`);
  const r = await model.generateContent(
    `An application for "${scheme.name}" was rejected. Reason given: "${reason}". Explain in plain words what it means, then list 3 concrete next steps to fix it or appeal.`
  );
  return r.response.text();
}

// Document scanning (OCR) using Gemini vision
export async function scanDocument({ buffer, mimeType, expected }) {
  const model = getModel(BASE, true);
  const r = await model.generateContent([
    { inlineData: { data: buffer.toString('base64'), mimeType } },
    `Read this document. Return JSON only:
{"documentType": string, "extractedText": string (max 400 chars), "fields": {"name": string|null, "dateOfBirth": string|null, "idNumberLast4": string|null}, "quality": "good"|"poor", "matchesExpected": boolean, "issues": string[]}
Expected document type: "${expected || 'unknown'}". Never output full ID numbers; only the last 4 digits.`,
  ]);
  try { return JSON.parse(r.response.text()); }
  catch { return { documentType: 'unknown', extractedText: r.response.text().slice(0, 400), quality: 'poor', matchesExpected: false, issues: ['Could not parse the result'] }; }
}
