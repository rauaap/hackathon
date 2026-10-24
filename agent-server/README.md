# Agent SDK backend

Makes the model call for the newsroom assistant. `api/news.ts` on Vercel builds the prompt, validates the output and enforces the access code and cost caps; this server only runs one Claude Agent SDK query per request and returns a Messages-API-shaped reply. Browsers never call it.

- `POST /generate` with `Authorization: Bearer $AGENT_BACKEND_SECRET` and `{system, prompt, schema}`; `GET /health`.
- No tools, no settings or memory files loaded, empty working directory, at most 2 concurrent runs, 55 s timeout.
- Listens on `127.0.0.1:8787`; Caddy terminates HTTPS at `https://178-62-229-130.sslip.io` (`/etc/caddy/Caddyfile`). Firewall allows only 22, 80 and 443.

Setup on the server:

```sh
python3 -m venv .venv && .venv/bin/pip install claude-agent-sdk fastapi uvicorn
echo "AGENT_BACKEND_SECRET=$(python3 -c 'import secrets;print(secrets.token_urlsafe(32))')" > .env   # gitignored; copy the value to Vercel
# optional: ANTHROPIC_API_KEY=... in .env; otherwise the CLI's existing login on this machine is used
systemctl enable --now agent-server   # unit: /etc/systemd/system/agent-server.service
journalctl -u agent-server -f
```
