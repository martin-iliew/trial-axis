"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Body,
  BodySmall,
  Caption,
  Heading5,
  Heading7,
  Heading9,
} from "@/components/ui/typography"
import { getMatchingMinimumDurationMs, type MatchingPreviewClinic } from "@/features/matching/presentation"
import MatchingStageCard from "./MatchingStageCard"

type MatchResponse = {
  count?: number
  error?: string
}

const stages = [
  {
    label: "Parsing Study Brief",
    detail: "Turning the CRO study definition into structured clinic criteria.",
  },
  {
    label: "Applying Hard Filters",
    detail: "Removing sites that miss required geography, capacity, or capability rules.",
  },
  {
    label: "Scoring Operational Fit",
    detail: "Weighting readiness, timeline overlap, and comparable-study signals.",
  },
  {
    label: "Ranking Shortlist",
    detail: "Finalizing the ordered list of clinics for CRO review.",
  },
] as const

export default function MatchingExperience({
  projectId,
  projectTitle,
  criteriaChips,
  previewQueue,
  totalClinics,
}: {
  projectId: string
  projectTitle: string
  criteriaChips: string[]
  previewQueue: MatchingPreviewClinic[]
  totalClinics: number
}) {
  const router = useRouter()
  const shellRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const previewCardRef = useRef<HTMLDivElement | null>(null)
  const [activeStage, setActiveStage] = useState(0)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [requestResult, setRequestResult] = useState<MatchResponse | null>(null)
  const [minimumElapsed, setMinimumElapsed] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const minimumDurationMs = useMemo(
    () => getMatchingMinimumDurationMs(totalClinics),
    [totalClinics],
  )
  const activePreview = previewQueue[previewIndex] ?? null

  useEffect(() => {
    const shell = shellRef.current
    const progress = progressRef.current

    if (!shell || !progress) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        shell.querySelectorAll("[data-animate='fade-up']"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
        },
      )

      gsap.fromTo(
        progress,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: minimumDurationMs / 1000,
          ease: "power2.inOut",
        },
      )
    }, shell)

    return () => ctx.revert()
  }, [minimumDurationMs])

  useEffect(() => {
    if (!previewCardRef.current) {
      return
    }

    gsap.fromTo(
      previewCardRef.current,
      { opacity: 0, y: 18, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out" },
    )
  }, [previewIndex])

  useEffect(() => {
    const stageStepMs = Math.max(Math.floor(minimumDurationMs / stages.length), 2200)
    const stageTimer = window.setInterval(() => {
      setActiveStage((current) => Math.min(current + 1, stages.length - 1))
    }, stageStepMs)

    const previewTimer = window.setInterval(() => {
      setPreviewIndex((current) => {
        if (previewQueue.length === 0) {
          return current
        }

        return (current + 1) % previewQueue.length
      })
    }, 1200)

    const minimumTimer = window.setTimeout(() => {
      setMinimumElapsed(true)
    }, minimumDurationMs)

    return () => {
      window.clearInterval(stageTimer)
      window.clearInterval(previewTimer)
      window.clearTimeout(minimumTimer)
    }
  }, [minimumDurationMs, previewQueue.length])

  useEffect(() => {
    let cancelled = false

    async function runMatch() {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trial_project_id: projectId }),
      })

      const data = (await response.json()) as MatchResponse

      if (cancelled) {
        return
      }

      if (!response.ok) {
        setErrorMessage(data.error ?? "Matching failed")
        setRequestResult(data)
        return
      }

      setRequestResult(data)
    }

    runMatch().catch((error: unknown) => {
      if (cancelled) {
        return
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected matching error",
      )
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  useEffect(() => {
    if (!minimumElapsed || !requestResult || errorMessage) {
      return
    }

    if ((requestResult.count ?? 0) > 0) {
      router.replace(`/cro/projects/${projectId}/matches`)
      return
    }

    setErrorMessage("No clinics met the required study criteria.")
  }, [errorMessage, minimumElapsed, projectId, requestResult, router])

  return (
    <div
      ref={shellRef}
      className="relative overflow-hidden rounded-[32px] border border-primary bg-subtle p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute inset-x-12 top-0 h-40 rounded-full bg-surface-level-2 blur-3xl" />

      <div className="relative space-y-8">
        <div data-animate="fade-up" className="space-y-3">
          <Badge>Contract Research Organization Match Run</Badge>
          <Heading5>{projectTitle}</Heading5>
          <Body className="max-w-3xl text-secondary">
            TrialAxis is scanning the clinic network, applying study constraints,
            and assembling a ranked shortlist for CRO review.
          </Body>
        </div>

        <div data-animate="fade-up" className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-primary bg-default p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <Caption className="text-secondary">Clinic Network</Caption>
                <Heading7>{totalClinics} sites under evaluation</Heading7>
              </div>
              <Badge className="bg-surface-status-info text-icon-status-info">
                Live deterministic ranking
              </Badge>
            </div>

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface-level-2">
              <div ref={progressRef} className="h-full rounded-full bg-inverse" />
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {criteriaChips.map((chip) => (
                <Badge key={chip} className="bg-surface-level-2 text-primary">
                  {chip}
                </Badge>
              ))}
            </div>

            {activePreview && (
              <div
                ref={previewCardRef}
                className="rounded-3xl border border-primary bg-surface-level-1 p-5"
              >
                <Caption className="mb-2 text-secondary">Currently evaluating</Caption>
                <Heading7>{activePreview.name}</Heading7>
                <BodySmall className="mt-1 text-secondary">
                  {activePreview.city}, {activePreview.country}
                </BodySmall>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-primary bg-default p-3">
                    <Caption className="text-secondary">Patient reach</Caption>
                    <Heading9>{activePreview.maxConcurrentTrials}</Heading9>
                  </div>
                  <div className="rounded-2xl border border-primary bg-default p-3">
                    <Caption className="text-secondary">Study readiness</Caption>
                    <Heading9>{activePreview.activeTrialCount}</Heading9>
                  </div>
                  <div className="rounded-2xl border border-primary bg-default p-3">
                    <Caption className="text-secondary">Profile tag</Caption>
                    <Heading9 className="capitalize">
                      {activePreview.siteType.replaceAll("_", " ")}
                    </Heading9>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div data-animate="fade-up" key={stage.label}>
                <MatchingStageCard
                  label={stage.label}
                  detail={stage.detail}
                  active={index === activeStage}
                  complete={index < activeStage}
                />
              </div>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div data-animate="fade-up" className="rounded-3xl border border-primary bg-default p-5">
            <Heading9 className="mb-2">Match run finished</Heading9>
            <BodySmall className="text-secondary">{errorMessage}</BodySmall>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => router.replace(`/cro/projects/${projectId}`)}>
                Return to study
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Run again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
