"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { taskApi } from "@/lib/api";
import type { TaskStatus } from "@/types/task";

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const status = (formData.get("status") as TaskStatus) || "todo";

  await taskApi.create({ title, description, status });
  redirect("/tasks");
}

export async function updateTask(id: number, formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const status = formData.get("status") as TaskStatus;

  await taskApi.update(id, { title, description, status });
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function deleteTask(id: number) {
  await taskApi.delete(id);
  revalidatePath("/tasks");
  redirect("/tasks");
}
