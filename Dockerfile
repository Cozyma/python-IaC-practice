# ---- Build stage ----
FROM python:3.12-slim AS builder

WORKDIR /build

COPY pyproject.toml .
ARG INSTALL_DEV=false
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir . \
    && if [ "$INSTALL_DEV" = "true" ]; then pip install --no-cache-dir ".[dev]"; fi

# ---- Runtime stage ----
FROM python:3.12-slim AS runtime

WORKDIR /app

RUN adduser --disabled-password --no-create-home appuser

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin/ /usr/local/bin/
COPY app/ ./app/

USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
