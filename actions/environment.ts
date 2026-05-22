"use server";

import { db } from "@/db";
import { envVariable } from "@/db/schema";
import { encryptValue } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

export async function addEnvironmentVariable(
  key: string,
  rawValue: string,
  environmentId: string,
  projectId: string,
) {
  if (!key || !rawValue || !environmentId) {
    return { error: "Faltan datos requeridos" };
  }

  try {
    const encryptedValue = encryptValue(rawValue);

    await db.insert(envVariable).values({
      id: crypto.randomUUID(),
      key: key.toUpperCase(),
      value: encryptedValue,
      environmentId,
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error al guardar la variable:", error);
    return { error: "Ocurrió un error al guardar la variable" };
  }
}
