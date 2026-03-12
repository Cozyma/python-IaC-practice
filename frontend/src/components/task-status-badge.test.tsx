import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TaskStatusBadge } from "./task-status-badge";

describe("TaskStatusBadge", () => {
  it("未着手ステータスを正しく表示する", () => {
    render(<TaskStatusBadge status="todo" />);
    expect(screen.getByText("未着手")).toBeInTheDocument();
  });

  it("進行中ステータスを正しく表示する", () => {
    render(<TaskStatusBadge status="in_progress" />);
    expect(screen.getByText("進行中")).toBeInTheDocument();
  });

  it("完了ステータスを正しく表示する", () => {
    render(<TaskStatusBadge status="done" />);
    expect(screen.getByText("完了")).toBeInTheDocument();
  });

  it("ステータスに応じたCSSクラスが適用される", () => {
    const { rerender } = render(<TaskStatusBadge status="todo" />);
    expect(screen.getByText("未着手").className).toContain("bg-gray-100");

    rerender(<TaskStatusBadge status="in_progress" />);
    expect(screen.getByText("進行中").className).toContain("bg-blue-100");

    rerender(<TaskStatusBadge status="done" />);
    expect(screen.getByText("完了").className).toContain("bg-green-100");
  });
});
