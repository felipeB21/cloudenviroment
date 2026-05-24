import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import ProjectCard from "@/components/project/card";
import CreateProjectDialog from "@/components/project/create-dialog";
import { FolderOpen } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireUser();

  const projects = await db.query.project.findMany({
    where: eq(project.userId, user.id),
    with: {
      environments: {
        columns: { id: true },
      },
    },
    orderBy: (p, { desc }) => desc(p.createdAt),
  });

  const isFree = user.plan === "FREE";
  const projectCount = projects.length;
  const atLimit = isFree && projectCount >= 2;

  return (
    <div className="flex flex-col gap-8 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your environments and secrets
          </p>
        </div>

        <CreateProjectDialog disabled={atLimit} />
      </div>

      {/* FREE plan limit bar */}
      {isFree && (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    i < projectCount ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {projectCount}
              </span>
              {" / 2 projects on Free plan"}
            </span>
          </div>
          {atLimit && (
            <a
              href="/billing"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Upgrade to Pro →
            </a>
          )}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded border border-dashed border-border py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              No projects yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first project to start managing environments
            </p>
          </div>
          <CreateProjectDialog disabled={false} variant="outline" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              name={p.name}
              repositoryUrl={p.repositoryUrl}
              webUrl={p.webUrl}
              environmentCount={p.environments.length}
              createdAt={p.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
