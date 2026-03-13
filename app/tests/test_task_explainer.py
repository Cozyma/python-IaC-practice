from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock

from app.schemas.task import TaskResponse, TaskStatus
from app.services.task_explainer import _build_user_prompt, explain_task_stream


def _make_task_response(
    task_id: int = 1,
    title: str = "テストタスク",
    description: str | None = "テスト説明",
    status: TaskStatus = TaskStatus.TODO,
) -> TaskResponse:
    from datetime import UTC, datetime

    return TaskResponse(
        id=task_id,
        title=title,
        description=description,
        status=status,
        created_at=datetime(2026, 1, 1, tzinfo=UTC),
        updated_at=datetime(2026, 1, 1, tzinfo=UTC),
    )


def _make_chunk(content: str | None) -> MagicMock:
    chunk = MagicMock()
    delta = MagicMock()
    delta.content = content
    choice = MagicMock()
    choice.delta = delta
    chunk.choices = [choice]
    return chunk


class TestBuildUserPrompt:
    def test_プロンプトにタスク情報が含まれる(self) -> None:
        task = _make_task_response(
            title="重要タスク",
            description="詳細な説明",
            status=TaskStatus.IN_PROGRESS,
        )
        prompt = _build_user_prompt(task)
        assert "重要タスク" in prompt
        assert "詳細な説明" in prompt
        assert "進行中" in prompt

    def test_説明なしの場合のプロンプト(self) -> None:
        task = _make_task_response(description=None)
        prompt = _build_user_prompt(task)
        assert "（説明なし）" in prompt


class TestExplainTaskStream:
    async def test_ストリーミングチャンクが正しく生成される(self) -> None:
        task = _make_task_response()

        async def mock_stream() -> AsyncGenerator[MagicMock, None]:
            yield _make_chunk("こんにちは")
            yield _make_chunk("、テスト")
            yield _make_chunk(None)  # content=None のチャンク

        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_stream()

        chunks = []
        async for chunk in explain_task_stream(mock_client, task):
            chunks.append(chunk)

        assert chunks[0] == "data: こんにちは\n\n"
        assert chunks[1] == "data: 、テスト\n\n"
        assert chunks[-1] == "data: [DONE]\n\n"
        # content=None のチャンクはスキップされるため3つ
        assert len(chunks) == 3

    async def test_空ストリームでもDONEが送信される(self) -> None:
        task = _make_task_response()

        async def mock_stream() -> AsyncGenerator[MagicMock, None]:
            return
            yield  # AsyncGenerator型にするためのyield

        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_stream()

        chunks = []
        async for chunk in explain_task_stream(mock_client, task):
            chunks.append(chunk)

        assert len(chunks) == 1
        assert chunks[0] == "data: [DONE]\n\n"
