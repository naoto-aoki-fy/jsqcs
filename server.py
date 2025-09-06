# server.py
# Minimal aiohttp server that serves static files and adds COOP/COEP headers
import asyncio
from aiohttp import web
import pathlib
import logging
import mimetypes

ROOT = pathlib.Path(__file__).parent.resolve()
DOCS = ROOT / "docs"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wasm-qsim-server")

@web.middleware
async def coop_coep_middleware(request, handler):
    # Attach COOP/COEP headers to every response
    try:
        resp = await handler(request)
    except web.HTTPException as ex:
        resp = ex
    # Headers can be added even if ex is web.FileResponse
    resp.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    resp.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    # Ensure Content-Type for wasm/js files (skip if aiohttp sets it automatically)
    path = request.path.lower()
    if path.endswith('.wasm'):
        resp.headers['Content-Type'] = 'application/wasm'
    elif path.endswith('.js'):
        resp.headers['Content-Type'] = 'application/javascript; charset=utf-8'
    return resp

async def spa_fallback(request):
    # Return index.html for SPA paths not found in static files
    index_file = DOCS / "index.html"
    if index_file.exists():
        return web.FileResponse(index_file)
    raise web.HTTPNotFound()

def create_app():
    app = web.Application(middlewares=[coop_coep_middleware])
    # Serve docs static files at the root path
    # NOTE: add_static prefix could also be '/' and static files take precedence if found
    app.router.add_static('/', path=str(DOCS), show_index=False)
    # Fallback to index.html (SPA) for paths not found statically
    app.router.add_get('/{tail:.*}', spa_fallback)
    return app

if __name__ == "__main__":
    app = create_app()
    port = 8080
    logger.info("Serving %s on http://localhost:%d", DOCS, port)
    web.run_app(app, port=port)
