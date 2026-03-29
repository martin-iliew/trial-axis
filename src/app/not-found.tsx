import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Body, Heading4 } from "@/components/ui/typography"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-default px-20 py-16">
      <Card className="w-full max-w-lg bg-surface-level-1">
        <CardHeader className="items-center gap-4 text-center">
          <Badge>404</Badge>
          <Heading4>Page not found</Heading4>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 text-center">
          <Body className="max-w-md text-secondary">
            You seem to have reached a page that doesn&apos;t exist or may never exist.
          </Body>

          <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button>Go home</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Back to login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
