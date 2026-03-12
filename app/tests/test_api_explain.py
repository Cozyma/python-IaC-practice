from unittest.mock import AsyncMock, MagicMock, patch

from httpx import ASGITransport, AsyncClient

from app.dependencies.openai import get_openai_client
from app.main import app


def _make_mock_task(
    task_id: int = 1,
    title: str = "テストタスク",
    description: str | None = "テスト説明",
    status: str = "todo",
) -> AsyncMock:
    from datetime import datetime, timezone

    mock = AsyncMock()
    mock.id = task_id
    mock.title = title
    mock.description = description
    mock.status = status
    mock.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    mock.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return mock


def _make_chunk(content: str | None) -> MagicMock:
    chunk = MagicMock()
    delta = MagicMock()
    delta.content = content
    choice = MagicMock()
    choice.delta = delta
    chunk.choices = [choice]
    return chunk


def _mock_openai_client() -> AsyncMock:
    async def mock_stream():
        yield _make_chunk("テスト解説")
        yield _make_chunk("です。")

    mock_client = AsyncMock()
    mock_client.chat.completions.create.return_value = mock_stream()
    return mock_client


class TestExplainEndpoint:
    async def test_タスク解説がSSEで返される(self) -> None:
        mock_task = _make_mock_task()
        mock_client = _mock_openai_client()

        app.dependency_overrides[get_openai_client] = lambda: mock_client

        try:
            with patch("app.api.tasks.get_task", return_value=mock_task):
                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    response = await client.post("/tasks/1/explain")

            assert response.status_code == 200
            assert response.headers["content-type"].startswith("text/event-stream")
            body = response.text
            assert "data: テスト解説" in body
            assert "data: です。" in body
            assert "data: [DONE]" in body
        finally:
            app.dependency_overrides.clear()

    async def test_存在しないタスクは404(self) -> None:
        mock_client = _mock_openai_client()
        app.dependency_overrides[get_openai_client] = lambda: mock_client

        try:
            with patch("app.api.tasks.get_task", return_value=None):
                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    response = await client.post("/tasks/999/explain")

            assert response.status_code == 404
        finally:
            app.dependency_overrides.clear()

    async def test_OPENAI_API_KEY未設定でもテストが通る(self) -> None:
        """CIで OPENAI_API_KEY 環境変数なしでも動作することを確認"""
        mock_task = _make_mock_task()
        mock_client = _mock_openai_client()

        app.dependency_overrides[get_openai_client] = lambda: mock_client

        try:
            with patch("app.api.tasks.get_task", return_value=mock_task):
                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    response = await client.post("/tasks/1/explain")

            assert response.status_code == 200
        finally:
            app.dependency_overrides.clear()
