from unittest.mock import AsyncMock, patch

from httpx import ASGITransport, AsyncClient

from app.dependencies.auth import get_current_user
from app.main import app
from app.schemas.task import TaskStatus
from app.tests.conftest import make_mock_user


def _make_mock_task(
    task_id: int = 1,
    title: str = "テストタスク",
    description: str | None = None,
    status: str = "todo",
    user_id: int | None = 1,
) -> AsyncMock:
    from datetime import datetime, timezone

    mock = AsyncMock()
    mock.id = task_id
    mock.title = title
    mock.description = description
    mock.status = status
    mock.user_id = user_id
    mock.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    mock.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return mock


def _override_auth() -> None:
    app.dependency_overrides[get_current_user] = lambda: make_mock_user()


def _clear_overrides() -> None:
    app.dependency_overrides.clear()


class TestCreateTask:
    async def test_タスクを作成できる(self) -> None:
        mock_task = _make_mock_task()
        _override_auth()

        try:
            with patch("app.api.tasks.create_task", return_value=mock_task):
                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    response = await client.post(
                        "/tasks", json={"title": "テストタスク"}
                    )

            assert response.status_code == 201
            data = response.json()
            assert data["title"] == "テストタスク"
            assert data["status"] == TaskStatus.TODO
        finally:
            _clear_overrides()

    async def test_未認証でタスク作成は401(self) -> None:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/tasks", json={"title": "テスト"})

        assert response.status_code == 401

    async def test_タイトル未指定は422エラー(self) -> None:
        _override_auth()
        try:
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post("/tasks", json={})

            assert response.status_code == 422
        finally:
            _clear_overrides()


class TestGetTasks:
    async def test_タスク一覧を取得できる(self) -> None:
        mock_tasks = [_make_mock_task(task_id=1), _make_mock_task(task_id=2, title="タスク2")]

        with patch("app.api.tasks.get_tasks", return_value=mock_tasks):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get("/tasks")

        assert response.status_code == 200
        assert len(response.json()) == 2


class TestGetTask:
    async def test_存在するタスクを取得できる(self) -> None:
        mock_task = _make_mock_task()

        with patch("app.api.tasks.get_task", return_value=mock_task):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get("/tasks/1")

        assert response.status_code == 200
        assert response.json()["title"] == "テストタスク"

    async def test_存在しないタスクは404(self) -> None:
        with patch("app.api.tasks.get_task", return_value=None):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get("/tasks/999")

        assert response.status_code == 404


class TestDeleteTask:
    async def test_タスクを削除できる(self) -> None:
        mock_task = _make_mock_task()
        _override_auth()

        try:
            with (
                patch("app.api.tasks.get_task", return_value=mock_task),
                patch("app.api.tasks.delete_task", return_value=None),
            ):
                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    response = await client.delete("/tasks/1")

            assert response.status_code == 204
        finally:
            _clear_overrides()

    async def test_未認証でタスク削除は401(self) -> None:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.delete("/tasks/1")

        assert response.status_code == 401
