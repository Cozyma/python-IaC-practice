import type { Task, TaskCreate, TaskUpdate } from "@/types/task";
import { getAccessToken } from "@/lib/auth";

const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.API_URL_INTERNAL ?? "http://app:8000")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  path: string,
  options?: RequestInit & { auth?: boolean },
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  // Add auth header if requested and token is available
  if (options?.auth !== false) {
    const token = typeof window !== "undefined" ? getAccessToken() : null;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const { auth: _, ...fetchOptions } = options ?? {};

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const taskApi = {
  list: (skip = 0, limit = 100) =>
    fetchApi<Task[]>(`/tasks?skip=${skip}&limit=${limit}`, { auth: false }),

  get: (id: number) => fetchApi<Task>(`/tasks/${id}`, { auth: false }),

  create: (data: TaskCreate) =>
    fetchApi<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: TaskUpdate) =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<void>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};

async function* streamExplain(id: number): AsyncGenerator<string, void, unknown> {
  const url = `${API_BASE_URL}/tasks/${id}/explain`;
  const headers: Record<string, string> = {};
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { method: "POST", headers });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, detail);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("ReadableStream not supported");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        yield data;
      }
    }
  }
}

export { ApiError, streamExplain };
