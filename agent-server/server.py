"""Agent SDK -taustapalvelu toimituksen avustajalle.

Vercel-funktio (api/news.ts) rakentaa kehotteen ja tarkistaa vastauksen; tämä palvelu tekee vain mallikutsun.
Asiakkaat eivät kutsu tätä suoraan, vaan pyynnöt tulevat Vercelistä jaetulla salaisuudella.
"""

import asyncio
import hashlib
import hmac
import json
import os
import tempfile

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

MODEL = os.environ.get("AGENT_MODEL", "claude-opus-5-5")
MIN_SECRET_LENGTH = 24
# 1 CPU / 2 Gt: jokainen kutsu käynnistää oman claude-aliprosessin.
slots = asyncio.Semaphore(int(os.environ.get("AGENT_MAX_CONCURRENT", "2")))
# Tyhjä työhakemisto, jotta palvelimen tiedostot tai CLAUDE.md eivät päädy kontekstiin.
workdir = tempfile.mkdtemp(prefix="agent-")

app = FastAPI()


class GenerateRequest(BaseModel):
    system: str = Field(max_length=20_000)
    prompt: str = Field(max_length=20_000)
    schema_: dict = Field(alias="schema")


def authorized(header: str | None) -> bool:
    secret = os.environ.get("AGENT_BACKEND_SECRET", "")
    if len(secret) < MIN_SECRET_LENGTH or not header or not header.startswith("Bearer "):
        return False
    digest = lambda v: hashlib.sha256(v.encode()).digest()
    return hmac.compare_digest(digest(header[7:]), digest(secret))


@app.get("/health")
async def health():
    return {"ok": True, "model": MODEL}


@app.post("/generate")
async def generate(body: GenerateRequest, authorization: str | None = Header(None)):
    if not authorized(authorization):
        raise HTTPException(401, "unauthorized")
    options = ClaudeAgentOptions(
        model=MODEL,
        system_prompt=body.system,
        output_format={"type": "json_schema", "schema": body.schema_},
        tools=[],
        setting_sources=[],
        effort="low",
        # Rakenteinen vastaus palautetaan SDK:n sisäisellä työkalulla, joten yksi kierros ei riitä.
        max_turns=3,
        cwd=workdir,
        env={"CLAUDE_CODE_DISABLE_AUTO_MEMORY": "1"},
    )
    result: ResultMessage | None = None
    async with slots:
        try:
            async with asyncio.timeout(55):
                async for message in query(prompt=body.prompt, options=options):
                    if isinstance(message, ResultMessage):
                        result = message
        except Exception as error:
            print("Agent run failed:", type(error).__name__, flush=True)
            raise HTTPException(502, "model_error")
    if result is None or result.is_error or result.structured_output is None:
        print("Agent returned no output:", result and (result.subtype, result.stop_reason), flush=True)
        raise HTTPException(502, "model_error")
    usage = result.usage or {}
    # Sama muoto kuin Messages API:n vastauksessa, jota api/news.ts jo käsittelee.
    # SDK palauttaa rakenteisen vastauksen työkalukutsuna, joten onnistunut ajo näkyy muuten "tool_use"-syynä.
    stop_reason = result.stop_reason if result.stop_reason in ("refusal", "max_tokens") else "end_turn"
    input_tokens = sum(
        usage.get(k, 0) for k in ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens")
    )
    return {
        "stop_reason": stop_reason,
        "content": [{"type": "text", "text": json.dumps(result.structured_output)}],
        "usage": {"input_tokens": input_tokens, "output_tokens": usage.get("output_tokens", 0)},
    }
