import { DefinitionList } from "@/components/shared/DefinitionList";
import { Badge } from "@/components/ui/badge";
import { Body } from "@/components/ui/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WEB_API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

function formatCreatedAt(createdAt: string | undefined): string {
  if (!createdAt) {
    return "Unavailable";
  }

  const parsed = new Date(createdAt);
  return Number.isNaN(parsed.getTime()) ? "Unavailable" : parsed.toLocaleString();
}

export default function HomePage() {
  const { user, isAdmin, canDo } = useAuth();
  const currentSessionItems = [
    { label: "Email", value: user?.email ?? "Unavailable" },
    { label: "Role", value: user?.role ?? "Unavailable" },
    { label: "Created", value: formatCreatedAt(user?.createdAt) },
  ];
  const runtimeConfigItems = [
    { label: "API Base URL", value: WEB_API_BASE_URL },
    { label: "Refresh Strategy", value: "Cookie session" },
    { label: "Admin Access", value: isAdmin() ? "Enabled" : "No" },
  ];
  const manageUsersEnabled = canDo("ManageUsers");

  return (
    <section className="flex w-full flex-col gap-6">
      <Card className="bg-surface-level-1">
        <CardHeader className="gap-3">
          <Badge className="w-fit">Backend Connected</Badge>
          <CardTitle className="text-3xl">Authenticated Web Console</CardTitle>
          <CardDescription className="max-w-3xl text-base">
          This frontend is now wired to the current backend auth contract and only shows
          features that the backend actually implements.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <DefinitionList items={currentSessionItems} />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Runtime Config</CardTitle>
          </CardHeader>
          <CardContent>
            <DefinitionList items={runtimeConfigItems} />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Available Capability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Body>
              Admin user management visibility is{" "}
              <span className="font-semibold text-primary">
                {manageUsersEnabled ? "enabled" : "disabled"}
              </span>{" "}
              for the current role.
            </Body>
            <Body>
              Notes and template flows stay removed until matching backend endpoints
              exist.
            </Body>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
