"use client";

import { useActionState } from "react";
import { createProject } from "@/actions/project";
import { ActionState } from "@/types/actions";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const initialState: ActionState = {
  error: null,
  success: false,
};

export default function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState(
    createProject,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="My Awesome Project"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="repositoryUrl">Repository URL (Optional)</Label>
        <Input
          id="repositoryUrl"
          name="repositoryUrl"
          type="url"
          placeholder="https://github.com/user/repo"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="webUrl">Web URL (Optional)</Label>
        <Input
          id="webUrl"
          name="webUrl"
          type="url"
          placeholder="https://my-app.com"
        />
      </div>

      {state.error && (
        <p className="text-destructive text-sm font-medium">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Project"}
      </Button>

      {state.success && (
        <p className="text-emerald-600 text-sm font-medium">
          Project created successfully!
        </p>
      )}
    </form>
  );
}
