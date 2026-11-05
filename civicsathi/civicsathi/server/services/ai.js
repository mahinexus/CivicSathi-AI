// Picks the AI provider from AI_PROVIDER ("gemini" default or "claude").
// If the primary provider fails and the other one has a key, it falls back automatically.
import * as gemini from './gemini.js';
import * as claude from './claude.js';

async function run(fn, args) {
  const primary = process.env.AI_PROVIDER === 'claude' ? claude : gemini;
  const other = primary === claude ? gemini : claude;
  const otherKey = primary === claude ? process.env.GEMINI_API_KEY : process.env.ANTHROPIC_API_KEY;
  try {
    return await primary[fn](args);
  } catch (e) {
    if (!otherKey) throw e;
    console.warn(`AI provider failed (${e.message}); trying fallback`);
    return other[fn](args);
  }
}
export const chat = (a) => run('chat', a);
export const guidance = (a) => run('guidance', a);
export const explainRejection = (a) => run('explainRejection', a);
export const scanDocument = (a) => run('scanDocument', a);
