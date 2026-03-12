import type { TaskStatus } from "@/types/task";

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: "未着手",
    className: "bg-gray-100 text-gray-700",
  },
  in_progress: {
    label: "進行中",
    className: "bg-blue-100 text-blue-700",
  },
  done: {
    label: "完了",
    className: "bg-green-100 text-green-700",
  },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
