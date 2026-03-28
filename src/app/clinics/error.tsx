"use client";

import Link from "next/link";
import { Heading7, BodySmall } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function ClinicsError() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4">
      <Heading7 className="text-secondary">Failed to load clinics</Heading7>
      <BodySmall className="text-tertiary">
        There was a problem fetching the clinic list.
      </BodySmall>
      <Link href="/">
        <Button variant="outline">Go home</Button>
      </Link>
    </div>
  );
}
