import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'prisma/config';

// Prisma CLI only auto-loads `.env`; this repo keeps every secret in `.env.local`.
// On Vercel/CI the vars are injected and no file exists, so this is a no-op there.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: 'prisma/schema.prisma',
});
