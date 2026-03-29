import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProjectsForCro } from "@/features/projects/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading5, Heading9, Body, BodySmall } from "@/components/ui/typography"

const statusColors: Record<string, string> = {
  draft: "bg-surface-level-2 text-secondary",
  active: "bg-surface-status-info text-icon-status-info",
  paused: "bg-surface-level-2 text-tertiary",
  completed: "bg-surface-status-success text-icon-status-success",
  archived: "bg-surface-level-2 text-tertiary",
}

export default async function ProjectsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: projects } = await getProjectsForCro(user.id)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading5>CRO Study Portfolio</Heading5>
        <Link href="/cro/projects/new">
          <Button>New Study</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary p-12 text-center">
          <Body className="text-secondary">No projects yet</Body>
          <BodySmall className="mt-1 text-tertiary">
            Create your first study to start matching with clinics.
          </BodySmall>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const area = project.therapeutic_areas as { name: string } | null
            const geographicPreference =
              "geographic_preference" in project &&
              typeof project.geographic_preference === "string"
                ? project.geographic_preference
                : null
            return (
              <Link
                key={project.id}
                href={`/cro/projects/${project.id}`}
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
                      {geographicPreference && (
                        <BodySmall className="text-secondary">
                          {geographicPreference}
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
