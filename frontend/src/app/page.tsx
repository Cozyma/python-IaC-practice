import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-20">
      <h1 className="text-4xl font-bold">Task Management</h1>
      <p className="text-lg text-gray-600">
        クラウドネイティブなタスク管理アプリケーション
      </p>
      <Link
        href="/tasks"
        className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
      >
        タスク一覧へ
      </Link>
    </div>
  );
}
