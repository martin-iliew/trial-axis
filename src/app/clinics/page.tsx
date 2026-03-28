import { createServerClient } from "@/lib/supabase/server"
import Navbar from "@/components/layout/Navbar"
import { Badge } from "@/components/ui/badge"
import {
  Heading5,
  Body,
  BodySmall,
  Caption,
} from "@/components/ui/typography"
import { MapPin } from "lucide-react"

export const metadata = {
  title: "Browse Clinics — TrialMatch",
  description: "Explore registered research sites across Bulgaria and Europe.",
}

export default async function ClinicsPage() {
  const supabase = await createServerClient()

  const { data: clinics } = await supabase
    .from("clinics")
    .select(
      "id, name, city, country, description, clinic_specializations(therapeutic_areas(name))"
    )
    .order("name")

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <Heading5 className="mb-2">Registered Clinics</Heading5>
          <BodySmall className="text-secondary">
            Browse the TrialMatch network — {clinics?.length ?? 0} research sites
            and growing.
          </BodySmall>
        </div>

        {!clinics || clinics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary p-12 text-center">
            <Body className="text-secondary">No clinics registered yet</Body>
            <BodySmall className="mt-1 text-tertiary">
              Check back soon as the network grows.
            </BodySmall>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {clinics.map((clinic) => {
              const specializations = (
                clinic.clinic_specializations ?? []
              )
                .map(
                  (cs) =>
                    (cs.therapeutic_areas as unknown as { name: string })
                      ?.name
                )
                .filter(Boolean)
                .slice(0, 3)

              return (
                <div
                  key={clinic.id}
                  className="rounded-2xl border border-primary bg-surface-level-1 p-5 transition-colors"
                >
                  <div className="mb-3">
                    <BodySmall className="font-semibold text-primary">
                      {clinic.name}
                    </BodySmall>
                    <div className="mt-1 flex items-center gap-1 text-secondary">
                      <MapPin className="size-3.5 text-icon-secondary" />
                      <Caption className="text-secondary">
                        {clinic.city}
                        {clinic.country ? `, ${clinic.country}` : ""}
                      </Caption>
                    </div>
                  </div>

                  {clinic.description && (
                    <Caption className="mb-3 line-clamp-2 text-tertiary">
                      {clinic.description}
                    </Caption>
                  )}

                  {specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {specializations.map((name) => (
                        <Badge key={name}>{name}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
