"use server";

import { db } from "@/db";
import { project, user } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { ActionState } from "@/types/actions";
import { createProjectSchema, updateProjectSchema } from "@/lib/schemas";

export async function createProject(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userSession = await requireUser();
  const userId = userSession.id;

  const validatedFields = createProjectSchema.safeParse({
    name: formData.get("name"),
    repositoryUrl: formData.get("repositoryUrl") || undefined,
    webUrl: formData.get("webUrl") || undefined,
  });

  if (!validatedFields.success) {
    return {
      error:
        validatedFields.error.flatten().fieldErrors.name?.[0] ||
        "Invalid form data",
      success: false,
    };
  }

  const { name, repositoryUrl, webUrl } = validatedFields.data;

  const [currentUser, [{ projectCount }]] = await Promise.all([
    db.query.user.findFirst({ where: eq(user.id, userId) }),
    db
      .select({ projectCount: count() })
      .from(project)
      .where(eq(project.userId, userId)),
  ]);

  if (currentUser?.plan === "FREE" && projectCount >= 2) {
    return {
      error: "Has alcanzado el límite de 2 proyectos. Actualiza a Pro.",
      success: false,
    };
  }

  await db.insert(project).values({
    id: crypto.randomUUID(),
    name,
    repositoryUrl: repositoryUrl || null,
    webUrl: webUrl || null,
    userId,
  });

  revalidatePath("/dashboard");
  return { success: true, error: null };
}

export async function updateProject(
  projectId: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userSession = await requireUser();

  const validatedFields = updateProjectSchema.safeParse({
    name: formData.get("name"),
    repositoryUrl: formData.get("repositoryUrl") || undefined,
    webUrl: formData.get("webUrl") || undefined,
  });

  if (!validatedFields.success) {
    return {
      error:
        validatedFields.error.flatten().fieldErrors.name?.[0] ||
        "Invalid form data",
      success: false,
    };
  }

  const existing = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, userSession.id)),
  });

  if (!existing) {
    return { error: "Proyecto no encontrado", success: false };
  }

  const { name, repositoryUrl, webUrl } = validatedFields.data;

  await db
    .update(project)
    .set({
      name,
      repositoryUrl: repositoryUrl || null,
      webUrl: webUrl || null,
    })
    .where(eq(project.id, projectId));

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  return { success: true, error: null };
}

export async function deleteProject(projectId: string): Promise<ActionState> {
  const userSession = await requireUser();

  // Verifica ownership antes de borrar
  const existing = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, userSession.id)),
  });

  if (!existing) {
    return { error: "Proyecto no encontrado", success: false };
  }

  await db.delete(project).where(eq(project.id, projectId));

  revalidatePath("/dashboard");
  return { success: true, error: null };
}
