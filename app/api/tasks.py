from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.task import create_task, delete_task, get_task, get_tasks, update_task
from app.database import get_db
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get(
    "",
    response_model=list[TaskResponse],
    summary="タスク一覧取得",
)
async def list_tasks(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> list[TaskResponse]:
    tasks = await get_tasks(db, skip=skip, limit=limit)
    return [TaskResponse.model_validate(t) for t in tasks]


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="タスク詳細取得",
    responses={404: {"description": "タスクが見つかりません"}},
)
async def read_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    task = await get_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="タスクが見つかりません",
        )
    return TaskResponse.model_validate(task)


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="タスク作成",
)
async def create_new_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    task = await create_task(db, task_in)
    return TaskResponse.model_validate(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="タスク更新",
    responses={404: {"description": "タスクが見つかりません"}},
)
async def update_existing_task(
    task_id: int,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    task = await get_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="タスクが見つかりません",
        )
    updated = await update_task(db, task, task_in)
    return TaskResponse.model_validate(updated)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="タスク削除",
    responses={404: {"description": "タスクが見つかりません"}},
)
async def delete_existing_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
) -> None:
    task = await get_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="タスクが見つかりません",
        )
    await delete_task(db, task)
