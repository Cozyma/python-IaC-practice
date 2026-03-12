import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TaskForm } from "./task-form";
import type { Task } from "@/types/task";

describe("TaskForm", () => {
  const mockAction = vi.fn();

  it("空のフォームが正しくレンダリングされる（作成モード）", () => {
    render(<TaskForm action={mockAction} />);

    expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    expect(screen.getByLabelText("説明")).toBeInTheDocument();
    expect(screen.getByLabelText("ステータス")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
  });

  it("デフォルト値が設定される（編集モード）", () => {
    const task: Task = {
      id: 1,
      title: "テストタスク",
      description: "テスト説明",
      status: "in_progress",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    render(<TaskForm action={mockAction} defaultValues={task} />);

    expect(screen.getByLabelText("タイトル")).toHaveValue("テストタスク");
    expect(screen.getByLabelText("説明")).toHaveValue("テスト説明");
    expect(screen.getByLabelText("ステータス")).toHaveValue("in_progress");
    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
  });

  it("タイトルが必須フィールドである", () => {
    render(<TaskForm action={mockAction} />);

    const titleInput = screen.getByLabelText("タイトル");
    expect(titleInput).toBeRequired();
  });

  it("ステータスの選択肢が3つ存在する", () => {
    render(<TaskForm action={mockAction} />);

    const select = screen.getByLabelText("ステータス");
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("未着手");
    expect(options[1]).toHaveTextContent("進行中");
    expect(options[2]).toHaveTextContent("完了");
  });
});
