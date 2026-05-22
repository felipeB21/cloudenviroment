"use server";

import { db } from "@/db";
import { project, user } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { ActionState } from "@/types/actions";
import { createProjectSchema } from "@/lib/schemas";

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

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (currentUser?.plan === "FREE") {
    const [result] = await db
      .select({ count: count() })
      .from(project)
      .where(eq(project.userId, userId));

    if (result.count >= 2) {
      return {
        error: "Has alcanzado el límite de 2 proyectos. Actualiza a Pro.",
        success: false,
      };
    }
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
