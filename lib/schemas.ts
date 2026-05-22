import { z } from "zod";

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const urlSchema = z
  .string()
  .refine((val) => val === "" || isValidUrl(val), {
    message: "Must be a valid URL",
  })
  .optional();

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(50, "Project name is too long"),
  repositoryUrl: urlSchema,
  webUrl: urlSchema,
});
