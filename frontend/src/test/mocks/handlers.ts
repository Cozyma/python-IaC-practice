import { http, HttpResponse } from "msw";
import type { Task } from "@/types/task";

const API_BASE_URL = "http://localhost:8000";

export const mockTasks: Task[] = [
  {
    id: 1,
    title: "テストタスク1",
    description: "テスト用の説明文",
    status: "todo",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "テストタスク2",
    description: null,
    status: "in_progress",
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
  {
    id: 3,
    title: "完了タスク",
    description: "完了済みのタスク",
    status: "done",
    created_at: "2026-01-03T00:00:00Z",
    updated_at: "2026-01-03T00:00:00Z",
  },
];

export const handlers = [
  http.get(`${API_BASE_URL}/tasks`, () => {
    return HttpResponse.json(mockTasks);
  }),

  http.get(`${API_BASE_URL}/tasks/:id`, ({ params }) => {
    const task = mockTasks.find((t) => t.id === Number(params.id));
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(task);
  }),

  http.post(`${API_BASE_URL}/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newTask: Task = {
      id: 4,
      title: body.title as string,
      description: (body.description as string) ?? null,
      status: (body.status as Task["status"]) ?? "todo",
      created_at: "2026-01-04T00:00:00Z",
      updated_at: "2026-01-04T00:00:00Z",
    };
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/tasks/:id`, async ({ params, request }) => {
    const task = mockTasks.find((t) => t.id === Number(params.id));
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...task, ...body });
  }),

  http.delete(`${API_BASE_URL}/tasks/:id`, ({ params }) => {
    const task = mockTasks.find((t) => t.id === Number(params.id));
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
