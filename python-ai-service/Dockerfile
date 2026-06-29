FROM python:3.12-slim

WORKDIR /app

# Install deps first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Match Coolify convention (PORT=3000, host mapping e.g. 5007:3000) — same as other VPS FastAPI apps
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-3000}"]
