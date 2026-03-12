import Link from "next/link";
import { taskApi } from "@/lib/api";
import { updateTask, deleteTask } from "../actions";
import { TaskForm } from "@/components/task-form";
import { DeleteButton } from "@/components/delete-button";
import { ExplainButton } from "@/components/explain-button";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskId = Number(id);
  const task = await taskApi.get(taskId);

  const updateTaskWithId = updateTask.bind(null, taskId);
  const deleteTaskWithId = deleteTask.bind(null, taskId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tasks" className="text-gray-500 hover:text-gray-700">
            ← 戻る
          </Link>
          <h1 className="text-2xl font-bold">タスク編集</h1>
        </div>
        <DeleteButton action={deleteTaskWithId} />
      </div>
      <TaskForm action={updateTaskWithId} defaultValues={task} />
      <ExplainButton taskId={taskId} />
    </div>
  );
}
