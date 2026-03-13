import Link from "next/link";
import { taskApi } from "@/lib/api";
import { TaskFormClient } from "@/components/task-form-client";
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

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/tasks" className="text-gray-500 hover:text-gray-700">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold">タスク編集</h1>
      </div>
      <TaskFormClient task={task} />
      <ExplainButton taskId={taskId} />
    </div>
  );
}
