import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { GET } from "./api/sources.ts";
import { GET as getNews, POST as postNews } from "./api/news.ts";
type Handlers = {
  GET?: () => Promise<Response>;
  POST?: (request: Request) => Promise<Response>;
};
function localSources(): Plugin {
  // Paikallisesti samat käsittelijät kuin Vercel Functionseina.
  const routes: [string, Handlers][] = [
    ["/api/sources", { GET }],
    ["/api/news", { GET: getNews, POST: postNews }],
  ];
  const setup = (server: { middlewares: { use: Function } }) => {
    for (const [path, handlers] of routes)
      server.middlewares.use(
        path,
        async (
          req: import("node:http").IncomingMessage,
          res: import("node:http").ServerResponse,
        ) => {
          const allowed = Object.keys(handlers).join(", ");
          try {
            let response: Response;
            if (req.method === "GET" && handlers.GET)
              response = await handlers.GET();
            else if (req.method === "POST" && handlers.POST) {
              const chunks: Buffer[] = [];
              for await (const chunk of req) chunks.push(chunk as Buffer);
              response = await handlers.POST(
                new Request(`http://localhost${path}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(req.headers.authorization
                      ? { Authorization: req.headers.authorization }
                      : {}),
                  },
                  body: Buffer.concat(chunks),
                }),
              );
            } else {
              res.writeHead(405, { Allow: allowed });
              res.end();
              return;
            }
            res.writeHead(
              response.status,
              Object.fromEntries(response.headers),
            );
            res.end(Buffer.from(await response.arrayBuffer()));
          } catch {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Sources unavailable" }));
          }
        },
      );
  };
  return {
    name: "local-source-api",
    configureServer: setup,
    configurePreviewServer: setup,
  };
}
export default defineConfig(({ mode }) => {
  // Avain luetaan .env.local-tiedostosta vain palvelimen prosessiin; ilman VITE_-etuliitettä se ei päädy selaimeen.
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "ANTHROPIC_API_KEY",
    "NEWSROOM_ACCESS_CODE",
    "ASSISTANT_MAX_CALLS_PER_HOUR",
    "ASSISTANT_MAX_CALLS_PER_DAY",
  ])
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  return { plugins: [react(), localSources()] };
});
