from httpx import ASGITransport, AsyncClient

from app.main import app


async def test_ヘルスチェックが正常に応答する() -> None:
    """ヘルスチェックエンドポイントがstatus okを返すこと"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data
