"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProject } from "@/actions/project";
import { ActionState } from "@/types/actions";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FolderGit2, Globe, Layers } from "lucide-react";
import { toast } from "sonner";

const initialState: ActionState = {
  error: null,
  success: false,
};

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export default function CreateProjectForm({
  onSuccess,
}: CreateProjectFormProps) {
  const [state, formAction, isPending] = useActionState(
    createProject,
    initialState,
  );

  const notifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.success && notifiedRef.current !== "success") {
      notifiedRef.current = "success";
      toast.success("Project created", {
        description: "Your project is ready to use.",
      });
      onSuccess?.();
    }
    if (state.error && notifiedRef.current !== state.error) {
      notifiedRef.current = state.error;
      toast.error("Something went wrong", { description: state.error });
    }
  }, [state.success, state.error, onSuccess]);

  return (
    <div className="w-full max-w-lg">
      <div className="rounded border border-border bg-card p-8 shadow-lg">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              New Project
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              configure your environment store
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="name"
              className="text-xs font-medium text-foreground/70"
            >
              Project Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="my-awesome-project"
              className="bg-background placeholder:text-muted-foreground/40 focus-visible:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground/60">optional</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="repositoryUrl"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground/70"
            >
              <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground" />
              Repository URL
            </Label>
            <Input
              id="repositoryUrl"
              name="repositoryUrl"
              type="url"
              placeholder="https://github.com/user/repo"
              className="bg-background placeholder:text-muted-foreground/40 focus-visible:ring-primary/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="webUrl"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground/70"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              Web URL
            </Label>
            <Input
              id="webUrl"
              name="webUrl"
              type="url"
              placeholder="https://my-app.com"
              className="bg-background placeholder:text-muted-foreground/40 focus-visible:ring-primary/40"
            />
          </div>

          <Button type="submit" disabled={isPending} className="mt-1 w-full">
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border border-primary-foreground/30 border-t-primary-foreground" />
                Creating...
              </span>
            ) : (
              "Create Project"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
