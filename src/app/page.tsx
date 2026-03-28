import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/layout/Navbar"
import {
  LandingHero,
  Heading3,
  Heading5,
  Body,
  BodySmall,
  Caption,
} from "@/components/ui/typography"
import { ClipboardList, Cpu, Handshake } from "lucide-react"

function StatCard({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-primary bg-surface-level-1 px-6 py-5">
      <Heading5 className="text-brand">{value}</Heading5>
      <Caption className="text-center text-secondary">{label}</Caption>
    </div>
  )
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary bg-surface-level-1 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-icon-primary">
        {icon}
      </div>
      <Badge>Step {step}</Badge>
      <Heading5>{title}</Heading5>
      <BodySmall className="text-secondary">{description}</BodySmall>
    </div>
  )
}

export default async function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-default px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-6">Clinical Trial Site Matching</Badge>
          <LandingHero className="mb-6">
            Match clinics to trials in minutes, not months
          </LandingHero>
          <Body className="mx-auto mb-10 max-w-2xl text-secondary">
            TrialMatch connects pharmaceutical sponsors with the best-fit research
            sites using intelligent, criteria-based matching. Stop relying on
            spreadsheets and phone calls — find the right clinic, faster.
          </Body>

          {/* Dual CTA */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register?role=sponsor">
              <Button size="lg">Join as Sponsor</Button>
            </Link>
            <Link href="/register?role=clinic_admin">
              <Button variant="outline" size="lg">
                Register Your Clinic
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-primary bg-subtle px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value="EUR 8M/day" label="Cost of enrollment delays" />
          <StatCard value="19-25%" label="EU trial slots go unfilled" />
          <StatCard
            value="EUR 6,500-15,000"
            label="Per recruited patient"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <Heading3 className="mb-3">How It Works</Heading3>
            <Body className="text-secondary">
              Three steps from trial requirements to clinic partnership
            </Body>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StepCard
              step={1}
              icon={<ClipboardList className="size-6" />}
              title="Define Your Trial"
              description="Create a project with therapeutic area, equipment needs, certifications, capacity, and geographic preferences."
            />
            <StepCard
              step={2}
              icon={<Cpu className="size-6" />}
              title="Run Matching"
              description="Our algorithm scores every registered clinic across five dimensions and ranks them by fit."
            />
            <StepCard
              step={3}
              icon={<Handshake className="size-6" />}
              title="Connect & Partner"
              description="Review detailed score breakdowns, view clinic profiles, and send partnership inquiries directly."
            />
          </div>
        </div>
      </section>

      {/* For Clinics Section */}
      <section className="border-t border-primary bg-subtle px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Heading3 className="mb-3">For Clinics</Heading3>
          <Body className="mb-8 text-secondary">
            Register your site, showcase your capabilities, and get matched with
            relevant trials automatically. No cold outreach — sponsors come to you.
          </Body>
          <Link href="/register?role=clinic_admin">
            <Button variant="outline" size="lg">
              Register Your Clinic
            </Button>
          </Link>
        </div>
      </section>

      {/* Browse CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Heading5 className="mb-3">Explore the Network</Heading5>
          <BodySmall className="mb-6 text-secondary">
            Browse registered clinics across Bulgaria and Europe to see the
            growing TrialMatch network.
          </BodySmall>
          <Link href="/clinics">
            <Button variant="outline">Browse Clinics</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary bg-surface-level-1 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Caption className="font-display font-semibold text-primary">
            TrialMatch
          </Caption>
          <Caption className="text-tertiary">
            AUBG Hackathon 2026 — Clinical Trial Site Matching MVP
          </Caption>
        </div>
      </footer>
    </>
  )
}
