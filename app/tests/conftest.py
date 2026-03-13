from datetime import datetime, timezone
from unittest.mock import AsyncMock


def make_mock_user(
    user_id: int = 1,
    email: str = "test@example.com",
    username: str = "testuser",
) -> AsyncMock:
    mock = AsyncMock()
    mock.id = user_id
    mock.email = email
    mock.username = username
    mock.hashed_password = "hashed"
    mock.is_active = True
    mock.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    mock.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return mock
