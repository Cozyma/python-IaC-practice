from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

from httpx import ASGITransport, AsyncClient

from app.dependencies.auth import get_current_user
from app.dependencies.openai import get_openai_client
from app.main import app
from app.tests.conftest import make_mock_user


def _make_mock_task(
    task_id: int = 1,
    title: str = "テストタスク",
    description: str | None = "テスト説明",
    status: str = "todo",
    user_id: int | None = 1,
) -> AsyncMock:
    from datetime import UTC, datetime

    mock = AsyncMock()
    mock.id = task_id
    mock.title = title
    mock.description = description
    mock.status = status
    mock.user_id = user_id
    mock.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    mock.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
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
    async def mock_stream() -> AsyncGenerator[MagicMock, None]:
        yield _make_chunk("テスト解説")
        yield _make_chunk("です。")

    mock_client = AsyncMock()
    mock_client.chat.completions.create.return_value = mock_stream()
    return mock_client


def _setup_overrides() -> None:
    app.dependency_overrides[get_openai_client] = _mock_openai_client
    app.dependency_overrides[get_current_user] = lambda: make_mock_user()


class TestExplainEndpoint:
    async def test_タスク解説がSSEで返される(self) -> None:
        mock_task = _make_mock_task()
        _setup_overrides()

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
        _setup_overrides()

        try:
            with patch("app.api.tasks.get_task", return_value=None):
                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    response = await client.post("/tasks/999/explain")

            assert response.status_code == 404
        finally:
            app.dependency_overrides.clear()

    async def test_未認証でタスク解説は401(self) -> None:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/tasks/1/explain")

        assert response.status_code == 401
