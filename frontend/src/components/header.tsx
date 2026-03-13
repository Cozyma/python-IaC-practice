"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Task Manager
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <Link
                href="/tasks"
                className="text-sm font-medium text-text hover:text-primary"
              >
                タスク一覧
              </Link>
            </li>
            {isLoading ? null : user ? (
              <>
                <li>
                  <span className="text-sm text-gray-500">
                    {user.username}
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => logout()}
                    className="text-sm font-medium text-gray-500 hover:text-primary"
                  >
                    ログアウト
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-text hover:text-primary"
                  >
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    登録
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
