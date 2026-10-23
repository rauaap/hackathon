import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { GET } from "./api/sources.ts";
function localSources(): Plugin {
  const setup = (server: { middlewares: { use: Function } }) => {
    server.middlewares.use(
      "/api/sources",
      async (
        req: import("node:http").IncomingMessage,
        res: import("node:http").ServerResponse,
      ) => {
        if (req.method !== "GET") {
          res.writeHead(405, { Allow: "GET" });
          res.end();
          return;
        }
        try {
          const response = await GET();
          res.writeHead(response.status, Object.fromEntries(response.headers));
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
export default defineConfig({ plugins: [react(), localSources()] });
