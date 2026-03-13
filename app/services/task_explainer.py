from collections.abc import AsyncGenerator

from openai import APIConnectionError, AsyncOpenAI, RateLimitError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config import settings
from app.schemas.task import TaskResponse

SYSTEM_PROMPT = (
    "あなたはタスク管理アシスタントです。"
    "与えられたタスクの情報（タイトル、説明、ステータス）をもとに、"
    "タスクの状況を簡潔にわかりやすく解説してください。"
    "ステータスに応じた次のアクションの提案も含めてください。"
)


def _build_user_prompt(task: TaskResponse) -> str:
    status_labels = {
        "todo": "未着手",
        "in_progress": "進行中",
        "done": "完了",
    }
    status_label = status_labels.get(task.status, task.status)
    description = task.description or "（説明なし）"
    return (
        f"タスク名: {task.title}\n"
        f"説明: {description}\n"
        f"ステータス: {status_label}"
    )


@retry(
    retry=retry_if_exception_type((RateLimitError, APIConnectionError)),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
async def explain_task_stream(
    client: AsyncOpenAI,
    task: TaskResponse,
) -> AsyncGenerator[str, None]:
    stream = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(task)},
        ],
        stream=True,
    )
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield f"data: {chunk.choices[0].delta.content}\n\n"
    yield "data: [DONE]\n\n"
