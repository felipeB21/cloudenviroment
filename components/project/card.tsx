"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteProject } from "@/actions/project";
import { Button } from "../ui/button";
import { FolderGit2, Globe, Layers, Trash2, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { toast } from "sonner";

interface ProjectCardProps {
  id: string;
  name: string;
  repositoryUrl: string | null;
  webUrl: string | null;
  environmentCount: number;
  createdAt: Date;
}

export default function ProjectCard({
  id,
  name,
  repositoryUrl,
  webUrl,
  environmentCount,
  createdAt,
}: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteProject(id);
    if (!result.success) {
      toast.error("Couldn't delete project", {
        description: result.error ?? "Something went wrong",
      });
      setIsDeleting(false);
    } else {
      toast.success("Project deleted", {
        description: `"${name}" has been removed.`,
      });
    }
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(createdAt);

  return (
    <div className="group relative flex flex-col rounded border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Card body — clickable */}
      <Link
        href={`/dashboard/${id}`}
        className="flex flex-1 flex-col gap-4 p-5"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-card-foreground leading-tight">
            {name}
          </h3>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-1.5">
          {repositoryUrl && (
            <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
              {new URL(repositoryUrl).hostname +
                new URL(repositoryUrl).pathname}
            </span>
          )}
          {webUrl && (
            <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              {new URL(webUrl).hostname}
            </span>
          )}
          {!repositoryUrl && !webUrl && (
            <span className="text-xs text-muted-foreground/40 italic">
              No URLs configured
            </span>
          )}
        </div>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {environmentCount}
            </span>{" "}
            {environmentCount === 1 ? "environment" : "environments"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/50">
            {formattedDate}
          </span>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => e.preventDefault()}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project and all its
                  environments and variables. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete project"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
