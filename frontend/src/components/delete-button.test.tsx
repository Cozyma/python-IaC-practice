import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DeleteButton } from "./delete-button";

describe("DeleteButton", () => {
  it("削除ボタンが表示される", () => {
    render(<DeleteButton action={vi.fn()} />);
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("確認ダイアログでOKを選択するとactionが呼ばれる", async () => {
    const user = userEvent.setup();
    const mockAction = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<DeleteButton action={mockAction} />);
    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
    expect(mockAction).toHaveBeenCalledOnce();
  });

  it("確認ダイアログでキャンセルを選択するとactionは呼ばれない", async () => {
    const user = userEvent.setup();
    const mockAction = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<DeleteButton action={mockAction} />);
    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(window.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
    expect(mockAction).not.toHaveBeenCalled();
  });
});
