import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProjectsForSponsor } from "@/features/projects/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading5, Heading9, Body, BodySmall } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  draft: "bg-surface-level-2 text-secondary",
  active: "bg-surface-status-info text-icon-status-info",
  paused: "bg-surface-status-warning text-icon-status-warning",
  completed: "bg-surface-status-success text-icon-status-success",
  archived: "bg-surface-level-2 text-tertiary",
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: tabParam } = await searchParams
  const tab = tabParam === "archived" ? "archived" : "active"

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: projects } = await getProjectsForSponsor(user.id, tab)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading5>Trial Projects</Heading5>
        <Link href="/sponsor/projects/new">
          <Button>New Trial Project</Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-1 border-b border-primary">
        {(["active", "archived"] as const).map((t) => (
          <Link
            key={t}
            href={t === "active" ? "/sponsor/projects" : "/sponsor/projects?tab=archived"}
            className={cn(
              "body-small -mb-px border-b-2 px-4 py-2.5 font-medium capitalize transition-colors",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-secondary hover:text-primary"
            )}
          >
            {t === "active" ? "Active" : "Archived"}
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary p-12 text-center">
          <Body className="text-secondary">
            {tab === "archived" ? "No archived projects" : "No projects yet"}
          </Body>
          {tab === "active" && (
            <BodySmall className="mt-1 text-tertiary">
              Create your first trial project to start matching with clinics.
            </BodySmall>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const area = project.therapeutic_areas as { name: string } | null
            return (
              <Link
                key={project.id}
                href={`/sponsor/projects/${project.id}`}
                className="block rounded-2xl border border-primary p-4 transition-colors hover:bg-subtle"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Heading9>{project.title}</Heading9>
                    <div className="mt-1 flex items-center gap-2">
                      {area && (
                        <BodySmall className="text-secondary">{area.name}</BodySmall>
                      )}
                      {project.phase && (
                        <BodySmall className="text-secondary">Phase {project.phase}</BodySmall>
                      )}
                      {project.geographic_preference && (
                        <BodySmall className="text-secondary">
                          {project.geographic_preference}
                        </BodySmall>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[project.status] ?? ""}>{project.status}</Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
