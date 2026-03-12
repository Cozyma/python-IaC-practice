"use client";

interface DeleteButtonProps {
  action: () => Promise<void>;
}

export function DeleteButton({ action }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (!confirm("このタスクを削除しますか？")) return;
    await action();
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
    >
      削除
    </button>
  );
}
