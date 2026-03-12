import Link from "next/link";
import { taskApi } from "@/lib/api";
import { TaskStatusBadge } from "@/components/task-status-badge";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await taskApi.list();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">タスク一覧</h1>
        <Link
          href="/tasks/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          新規作成
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500">タスクがありません</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/tasks/${task.id}`}
                className="block rounded-lg border border-border bg-white p-4 transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{task.title}</h2>
                  <TaskStatusBadge status={task.status} />
                </div>
                {task.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {task.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
