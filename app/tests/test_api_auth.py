from unittest.mock import AsyncMock, patch

from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.auth import hash_password


def _make_mock_user(
    user_id: int = 1,
    email: str = "test@example.com",
    username: str = "testuser",
    password: str = "password123",
    is_active: bool = True,
) -> AsyncMock:
    from datetime import datetime, timezone

    mock = AsyncMock()
    mock.id = user_id
    mock.email = email
    mock.username = username
    mock.hashed_password = hash_password(password)
    mock.is_active = is_active
    mock.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    mock.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return mock


class TestRegister:
    async def test_ユーザー登録できる(self) -> None:
        mock_user = _make_mock_user()

        with (
            patch("app.api.auth.get_user_by_email", return_value=None),
            patch("app.api.auth.create_user", return_value=mock_user),
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/auth/register",
                    json={
                        "email": "test@example.com",
                        "username": "testuser",
                        "password": "password123",
                    },
                )

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"
        assert "password" not in data
        assert "hashed_password" not in data

    async def test_重複メールは409(self) -> None:
        existing = _make_mock_user()

        with patch("app.api.auth.get_user_by_email", return_value=existing):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/auth/register",
                    json={
                        "email": "test@example.com",
                        "username": "testuser",
                        "password": "password123",
                    },
                )

        assert response.status_code == 409


class TestLogin:
    async def test_正しい認証情報でログインできる(self) -> None:
        mock_user = _make_mock_user()

        with patch("app.api.auth.get_user_by_email", return_value=mock_user):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/auth/login",
                    json={"email": "test@example.com", "password": "password123"},
                )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_間違ったパスワードは401(self) -> None:
        mock_user = _make_mock_user()

        with patch("app.api.auth.get_user_by_email", return_value=mock_user):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/auth/login",
                    json={"email": "test@example.com", "password": "wrongpassword"},
                )

        assert response.status_code == 401

    async def test_存在しないユーザーは401(self) -> None:
        with patch("app.api.auth.get_user_by_email", return_value=None):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/auth/login",
                    json={"email": "nouser@example.com", "password": "password123"},
                )

        assert response.status_code == 401

    async def test_無効アカウントは403(self) -> None:
        mock_user = _make_mock_user(is_active=False)

        with patch("app.api.auth.get_user_by_email", return_value=mock_user):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/auth/login",
                    json={"email": "test@example.com", "password": "password123"},
                )

        assert response.status_code == 403


class TestLogout:
    async def test_ログアウトできる(self) -> None:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/auth/logout")

        assert response.status_code == 204
