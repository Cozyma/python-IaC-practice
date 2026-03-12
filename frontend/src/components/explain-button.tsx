"use client";

import { useState, useCallback } from "react";
import { streamExplain } from "@/lib/api";

interface ExplainButtonProps {
  taskId: number;
}

export function ExplainButton({ taskId }: ExplainButtonProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = useCallback(async () => {
    setText("");
    setError(null);
    setLoading(true);

    try {
      for await (const chunk of streamExplain(taskId)) {
        setText((prev) => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  return (
    <div className="mt-6 space-y-3">
      <button
        onClick={handleExplain}
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "解説中..." : "AIで解説"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {text && (
        <div className="rounded-lg border border-border bg-gray-50 p-4 text-sm whitespace-pre-wrap leading-relaxed">
          {text}
        </div>
      )}
    </div>
  );
}
