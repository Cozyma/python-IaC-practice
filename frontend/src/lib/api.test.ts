import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "@/test/mocks/server";
import { taskApi, ApiError } from "./api";
import { http, HttpResponse } from "msw";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("taskApi", () => {
  describe("list", () => {
    it("タスク一覧を取得できる", async () => {
      const tasks = await taskApi.list();
      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe("テストタスク1");
    });
  });

  describe("get", () => {
    it("指定IDのタスクを取得できる", async () => {
      const task = await taskApi.get(1);
      expect(task.id).toBe(1);
      expect(task.title).toBe("テストタスク1");
    });

    it("存在しないIDで404エラーが発生する", async () => {
      await expect(taskApi.get(999)).rejects.toThrow(ApiError);
    });
  });

  describe("create", () => {
    it("新しいタスクを作成できる", async () => {
      const task = await taskApi.create({
        title: "新規タスク",
        description: "テスト",
      });
      expect(task.id).toBe(4);
      expect(task.title).toBe("新規タスク");
    });
  });

  describe("update", () => {
    it("タスクを更新できる", async () => {
      const task = await taskApi.update(1, { title: "更新タスク" });
      expect(task.title).toBe("更新タスク");
    });
  });

  describe("delete", () => {
    it("タスクを削除できる", async () => {
      await expect(taskApi.delete(1)).resolves.toBeUndefined();
    });
  });

  describe("エラーハンドリング", () => {
    it("サーバーエラー時にApiErrorがスローされる", async () => {
      server.use(
        http.get("http://localhost:8000/tasks", () => {
          return new HttpResponse("Internal Server Error", { status: 500 });
        }),
      );

      await expect(taskApi.list()).rejects.toThrow(ApiError);
      try {
        await taskApi.list();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
      }
    });
  });
});
