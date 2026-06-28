import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import type { ServerResponse } from 'node:http'

// Vercel only executes files under /api in its own serverless runtime
// (via `vercel dev` or a real deploy). This middleware lets `vite dev`
// run the exact same handlers locally, so there's no separate code path
// to keep in sync with production.
function vercelApiDevPlugin(): Plugin {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const routeName = req.url.split('?')[0]!.replace('/api/', '')
        const modulePath = path.resolve(__dirname, `api/${routeName}.ts`)

        try {
          const mod = await server.ssrLoadModule(modulePath)

          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const rawBody = Buffer.concat(chunks).toString('utf-8')
          ;(req as typeof req & { body: unknown }).body = rawBody ? JSON.parse(rawBody) : {}

          const shimmedRes = res as ServerResponse & {
            status: (code: number) => ServerResponse
            json: (body: unknown) => void
          }
          shimmedRes.status = (code: number) => {
            res.statusCode = code
            return shimmedRes
          }
          shimmedRes.json = (body: unknown) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          }

          await mod.default(req, shimmedRes)
        } catch (err) {
          console.error(`[api/${routeName}]`, err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Non-VITE_-prefixed vars (like ANTHROPIC_API_KEY) aren't exposed to
  // import.meta.env by design — load them separately for the dev-only
  // API middleware, mirroring how Vercel injects them in production.
  const env = loadEnv(mode, process.cwd(), '')
  process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY = env.FIREBASE_SERVICE_ACCOUNT_KEY

  return {
    plugins: [react(), tailwindcss(), vercelApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
