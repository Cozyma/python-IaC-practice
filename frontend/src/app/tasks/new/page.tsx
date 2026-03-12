import Link from "next/link";
import { createTask } from "../actions";
import { TaskForm } from "@/components/task-form";

export default function NewTaskPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/tasks" className="text-gray-500 hover:text-gray-700">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold">タスク作成</h1>
      </div>
      <TaskForm action={createTask} />
    </div>
  );
}
