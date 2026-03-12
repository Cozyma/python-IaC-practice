import pytest
from pydantic import ValidationError

from app.schemas.task import TaskCreate, TaskStatus, TaskUpdate


class TestTaskCreate:
    def test_必須フィールドのみで作成できる(self) -> None:
        task = TaskCreate(title="テストタスク")
        assert task.title == "テストタスク"
        assert task.description is None
        assert task.status == TaskStatus.TODO

    def test_全フィールド指定で作成できる(self) -> None:
        task = TaskCreate(
            title="テストタスク",
            description="詳細説明",
            status=TaskStatus.IN_PROGRESS,
        )
        assert task.title == "テストタスク"
        assert task.description == "詳細説明"
        assert task.status == TaskStatus.IN_PROGRESS

    def test_空タイトルはバリデーションエラー(self) -> None:
        with pytest.raises(ValidationError):
            TaskCreate(title="")

    def test_タイトル256文字はバリデーションエラー(self) -> None:
        with pytest.raises(ValidationError):
            TaskCreate(title="a" * 256)


class TestTaskUpdate:
    def test_部分更新が可能(self) -> None:
        update = TaskUpdate(title="新しいタイトル")
        assert update.title == "新しいタイトル"
        assert update.description is None
        assert update.status is None

    def test_全フィールドNoneで作成できる(self) -> None:
        update = TaskUpdate()
        assert update.title is None
