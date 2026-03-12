import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Task Manager
        </Link>
        <nav>
          <ul className="flex gap-6">
            <li>
              <Link
                href="/tasks"
                className="text-sm font-medium text-text hover:text-primary"
              >
                タスク一覧
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
