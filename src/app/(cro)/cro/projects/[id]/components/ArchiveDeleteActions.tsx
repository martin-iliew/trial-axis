"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { archiveProject, deleteProject } from "@/features/projects/actions"

export default function ArchiveDeleteActions({
  projectId,
  status,
}: {
  projectId: string
  status: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status === "archived") return null

  async function handleArchive() {
    setLoading(true)
    const result = await archiveProject(projectId)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    toast.success("Project archived")
    router.push("/cro/projects")
  }

  async function handleDelete() {
    if (!window.confirm("Delete this draft? This cannot be undone.")) return
    setLoading(true)
    const result = await deleteProject(projectId)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    toast.success("Project deleted")
    router.push("/cro/projects")
  }

  return (
    <>
      {status === "draft" ? (
        <Button
          variant="outline"
          disabled={loading}
          onClick={handleDelete}
          className="border-icon-status-danger text-icon-status-danger hover:bg-surface-status-danger"
        >
          {loading ? "Deleting…" : "Delete"}
        </Button>
      ) : (
        <Button
          variant="outline"
          disabled={loading}
          onClick={handleArchive}
          className="border-primary text-secondary hover:bg-subtle"
        >
          {loading ? "Archiving…" : "Archive"}
        </Button>
      )}
    </>
  )
}
