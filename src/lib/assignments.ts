import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";

import { db } from "#/db";
import { assignments } from "#/db/schema";
import { requireUserId } from "#/lib/session.server";

export const getAssignments = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  return db
    .select()
    .from(assignments)
    .where(eq(assignments.userId, userId))
    .orderBy(assignments.dueDate);
});

export const createAssignment = createServerFn({ method: "POST" })
  .validator((data: { title: string; dueDate: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await db.insert(assignments).values({
      title: data.title,
      dueDate: new Date(data.dueDate),
      userId,
    });
  });

export const deleteAssignment = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await db.delete(assignments).where(and(eq(assignments.id, data.id), eq(assignments.userId, userId)));
  });

export const updateAssignment = createServerFn({ method: "POST" })
  .validator((data: { id: number; title: string; dueDate: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await db.update(assignments).set({
      title: data.title,
      dueDate: new Date(data.dueDate),
    }).where(and(eq(assignments.id, data.id), eq(assignments.userId, userId)));
  });
