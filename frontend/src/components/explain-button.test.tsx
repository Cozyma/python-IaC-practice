import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ExplainButton } from "./explain-button";

vi.mock("@/lib/api", () => ({
  streamExplain: vi.fn(),
}));

import { streamExplain } from "@/lib/api";

describe("ExplainButton", () => {
  it("AIで解説ボタンが表示される", () => {
    render(<ExplainButton taskId={1} />);
    expect(
      screen.getByRole("button", { name: "AIで解説" }),
    ).toBeInTheDocument();
  });

  it("ボタン押下でストリーミングテキストが表示される", async () => {
    const user = userEvent.setup();

    async function* mockStream() {
      yield "テスト";
      yield "解説";
    }
    vi.mocked(streamExplain).mockReturnValue(mockStream());

    render(<ExplainButton taskId={1} />);
    await user.click(screen.getByRole("button", { name: "AIで解説" }));

    expect(await screen.findByText("テスト解説")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージが表示される", async () => {
    const user = userEvent.setup();

    async function* mockStream(): AsyncGenerator<string, void, unknown> {
      throw new Error("API接続エラー");
      yield;
    }
    vi.mocked(streamExplain).mockReturnValue(mockStream());

    render(<ExplainButton taskId={1} />);
    await user.click(screen.getByRole("button", { name: "AIで解説" }));

    expect(await screen.findByText("API接続エラー")).toBeInTheDocument();
  });
});
