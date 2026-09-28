import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse, Response, StreamingResponse

from ..config import get_settings
from ..schemas import ChatPayload

router = APIRouter()


def error_response(status_code: int, message: str) -> JSONResponse:
    # 与旧 Node 版代理一致的错误格式 { error: { message } }
    return JSONResponse(status_code=status_code, content={"error": {"message": message}})


@router.post("/chat")
async def chat(payload: ChatPayload):
    messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    if not messages:
        return error_response(400, "Missing chat messages.")

    settings = get_settings()
    if not settings.longcat_api_key:
        return error_response(500, "Missing LONGCAT_API_KEY or ZHIPU_API_KEY on the server.")

    request_body = {
        "model": settings.longcat_model,
        "stream": True,
        "temperature": 0.7,
        "messages": messages,
    }

    client = httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=10.0))
    request = client.build_request(
        "POST",
        settings.longcat_chat_url,
        json=request_body,
        headers={"Authorization": f"Bearer {settings.longcat_api_key}"},
    )

    try:
        upstream = await client.send(request, stream=True)
    except httpx.HTTPError as exc:
        await client.aclose()
        return error_response(500, f"Failed to reach Longcat: {exc}")

    if upstream.status_code != 200:
        raw = await upstream.aread()
        await upstream.aclose()
        await client.aclose()
        message = f"Longcat request failed with status {upstream.status_code}"
        try:
            data = httpx.Response(200, content=raw).json()
            message = data.get("error", {}).get("message") or data.get("message") or message
        except Exception:
            pass
        return error_response(upstream.status_code, message)

    content_type = upstream.headers.get("content-type", "")

    if "text/event-stream" not in content_type:
        body = await upstream.aread()
        await upstream.aclose()
        await client.aclose()
        return Response(
            content=body,
            media_type=content_type or "application/json; charset=utf-8",
        )

    async def stream():
        try:
            async for chunk in upstream.aiter_raw():
                yield chunk
        finally:
            await upstream.aclose()
            await client.aclose()

    return StreamingResponse(
        stream(),
        media_type="text/event-stream; charset=utf-8",
        headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
    )
