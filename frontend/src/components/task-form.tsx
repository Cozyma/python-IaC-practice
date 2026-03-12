import type { Task } from "@/types/task";

interface TaskFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Task;
}

export function TaskForm({ action, defaultValues }: TaskFormProps) {
  return (
    <form action={action} className="space-y-4 rounded-lg border border-border bg-white p-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          タイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={255}
          defaultValue={defaultValues?.title}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaultValues?.description ?? ""}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          ステータス
        </label>
        <select
          id="status"
          name="status"
          defaultValue={defaultValues?.status ?? "todo"}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="todo">未着手</option>
          <option value="in_progress">進行中</option>
          <option value="done">完了</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        {defaultValues ? "更新" : "作成"}
      </button>
    </form>
  );
}
