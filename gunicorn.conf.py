# Gunicorn configuration.
#
# Render auto-detects and runs `gunicorn backend.main:app`. Gunicorn's default
# sync worker treats the app as WSGI (environ, start_response), but FastAPI is
# an ASGI app (scope, receive, send), so every request crashes with:
#   TypeError: FastAPI.__call__() missing 1 required positional argument: 'send'
#
# Forcing the Uvicorn worker makes gunicorn serve the ASGI app correctly with
# no dashboard changes. Requires uvicorn (already in backend/requirements.txt).
worker_class = "uvicorn.workers.UvicornWorker"
