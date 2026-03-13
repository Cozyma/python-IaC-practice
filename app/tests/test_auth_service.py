from app.services.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    def test_パスワードをハッシュ化できる(self) -> None:
        hashed = hash_password("password123")
        assert hashed != "password123"
        assert hashed.startswith("$2b$")

    def test_正しいパスワードを検証できる(self) -> None:
        hashed = hash_password("password123")
        assert verify_password("password123", hashed) is True

    def test_間違ったパスワードは拒否される(self) -> None:
        hashed = hash_password("password123")
        assert verify_password("wrongpassword", hashed) is False


class TestJWT:
    def test_アクセストークンを生成と検証できる(self) -> None:
        token = create_access_token({"sub": "1"})
        payload = decode_token(token)
        assert payload["sub"] == "1"
        assert payload["type"] == "access"

    def test_リフレッシュトークンを生成と検証できる(self) -> None:
        token = create_refresh_token({"sub": "1"})
        payload = decode_token(token)
        assert payload["sub"] == "1"
        assert payload["type"] == "refresh"

    def test_アクセスとリフレッシュは異なるトークン(self) -> None:
        access = create_access_token({"sub": "1"})
        refresh = create_refresh_token({"sub": "1"})
        assert access != refresh
