"use server";

import { db } from "@/db";
import { environment, envVariable, project } from "@/db/schema";
import { encryptValue, decryptValue } from "@/lib/encryption";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { ActionState } from "@/types/actions";

async function verifyEnvironmentOwnership(
  environmentId: string,
  userId: string,
) {
  const env = await db.query.environment.findFirst({
    where: eq(environment.id, environmentId),
    with: { project: true },
  });

  if (!env || env.project.userId !== userId) return null;
  return env;
}

export async function createEnvironment(
  projectId: string,
  name: string,
): Promise<ActionState> {
  const user = await requireUser();

  if (!name?.trim()) {
    return { error: "El nombre es requerido", success: false };
  }

  const existingProject = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, user.id)),
  });

  if (!existingProject) {
    return { error: "Proyecto no encontrado", success: false };
  }

  await db.insert(environment).values({
    id: crypto.randomUUID(),
    name: name.trim(),
    projectId,
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, error: null };
}

export async function deleteEnvironment(
  environmentId: string,
  projectId: string,
): Promise<ActionState> {
  const user = await requireUser();

  const env = await verifyEnvironmentOwnership(environmentId, user.id);
  if (!env) return { error: "Environment no encontrado", success: false };

  await db.delete(environment).where(eq(environment.id, environmentId));

  revalidatePath(`/projects/${projectId}`);
  return { success: true, error: null };
}

export async function addEnvironmentVariable(
  key: string,
  rawValue: string,
  environmentId: string,
  projectId: string,
): Promise<ActionState> {
  const user = await requireUser();

  if (!key || !rawValue || !environmentId) {
    return { error: "Faltan datos requeridos", success: false };
  }

  const env = await verifyEnvironmentOwnership(environmentId, user.id);
  if (!env) return { error: "No autorizado", success: false };

  const encryptedValue = encryptValue(rawValue);

  await db.insert(envVariable).values({
    id: crypto.randomUUID(),
    key: key.toUpperCase(),
    value: encryptedValue,
    environmentId,
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, error: null };
}

export async function updateEnvironmentVariable(
  variableId: string,
  key: string,
  rawValue: string,
  projectId: string,
): Promise<ActionState> {
  const user = await requireUser();

  if (!key || !rawValue) {
    return { error: "Faltan datos requeridos", success: false };
  }

  const variable = await db.query.envVariable.findFirst({
    where: eq(envVariable.id, variableId),
    with: { environment: { with: { project: true } } },
  });

  if (!variable || variable.environment.project.userId !== user.id) {
    return { error: "No autorizado", success: false };
  }

  await db
    .update(envVariable)
    .set({
      key: key.toUpperCase(),
      value: encryptValue(rawValue),
    })
    .where(eq(envVariable.id, variableId));

  revalidatePath(`/projects/${projectId}`);
  return { success: true, error: null };
}

export async function deleteEnvironmentVariable(
  variableId: string,
  projectId: string,
): Promise<ActionState> {
  const user = await requireUser();

  const variable = await db.query.envVariable.findFirst({
    where: eq(envVariable.id, variableId),
    with: { environment: { with: { project: true } } },
  });

  if (!variable || variable.environment.project.userId !== user.id) {
    return { error: "No autorizado", success: false };
  }

  await db.delete(envVariable).where(eq(envVariable.id, variableId));

  revalidatePath(`/projects/${projectId}`);
  return { success: true, error: null };
}

export async function getDecryptedVariables(
  environmentId: string,
): Promise<
  | { success: true; data: { key: string; value: string }[] }
  | { success: false; error: string }
> {
  const user = await requireUser();

  const env = await verifyEnvironmentOwnership(environmentId, user.id);
  if (!env) return { success: false, error: "No autorizado" };

  const variables = await db.query.envVariable.findMany({
    where: eq(envVariable.environmentId, environmentId),
    orderBy: (v, { asc }) => asc(v.key),
  });

  return {
    success: true,
    data: variables.map((v) => ({
      key: v.key,
      value: decryptValue(v.value),
    })),
  };
}

export async function exportEnvFile(
  environmentId: string,
): Promise<
  { success: true; content: string } | { success: false; error: string }
> {
  const result = await getDecryptedVariables(environmentId);

  if (!result.success) return result;

  const content = result.data
    .map(({ key, value }) => `${key}=${value}`)
    .join("\n");

  return { success: true, content };
}
