import type { Task, TaskCreate, TaskUpdate } from "@/types/task";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
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
    fetchApi<Task[]>(`/tasks?skip=${skip}&limit=${limit}`),

  get: (id: number) => fetchApi<Task>(`/tasks/${id}`),

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

export { ApiError };
