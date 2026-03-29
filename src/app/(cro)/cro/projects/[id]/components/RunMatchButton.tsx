"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function RunMatchButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleMatch() {
    setLoading(true)
    router.push(`/cro/projects/${projectId}/matching`)
  }

  return (
    <Button onClick={handleMatch} disabled={loading}>
      {loading ? "Preparing Match..." : "Find Matching Clinics"}
    </Button>
  )
}
