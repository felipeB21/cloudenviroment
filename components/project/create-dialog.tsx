"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import CreateProjectForm from "./create-form";
import { Plus } from "lucide-react";

interface CreateProjectDialogProps {
  disabled?: boolean;
  variant?: "default" | "outline";
}

export default function CreateProjectDialog({
  disabled = false,
  variant = "default",
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          disabled={disabled}
          title={
            disabled ? "Upgrade to Pro to create more projects" : undefined
          }
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Create new project</DialogTitle>
        </DialogHeader>
        <CreateProjectForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
