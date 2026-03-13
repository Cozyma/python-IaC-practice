import Link from "next/link";
import { TaskFormClient } from "@/components/task-form-client";

export default function NewTaskPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/tasks" className="text-gray-500 hover:text-gray-700">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold">タスク作成</h1>
      </div>
      <TaskFormClient />
    </div>
  );
}
