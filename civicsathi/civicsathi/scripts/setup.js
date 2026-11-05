// Creates server/.env from the example file if it does not exist yet.
import fs from 'node:fs';
const env = new URL('../server/.env', import.meta.url);
const example = new URL('../server/.env.example', import.meta.url);
if (fs.existsSync(env)) console.log('server/.env already exists, leaving it alone.');
else { fs.copyFileSync(example, env); console.log('Created server/.env. Open it and add your GEMINI_API_KEY (and JWT_SECRET).'); }
