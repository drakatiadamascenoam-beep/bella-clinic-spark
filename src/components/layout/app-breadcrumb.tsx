import { Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { navigationItems } from "@/config/navigation.config";

const SEGMENT_LABELS: Record<string, string> = {
  perfil: "Perfil",
  novo: "Novo",
  editar: "Editar",
};

function humanize(segment: string): string {
  const known = navigationItems.find((item) => item.url === `/${segment}`);
  if (known) return known.title;
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  return segment
    .replace(/-/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function AppBreadcrumb() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:flex">
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              Bella IA
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <Fragment key={`${segment}-${index}`}>
              <BreadcrumbSeparator className="hidden sm:flex" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium">{humanize(segment)}</BreadcrumbPage>
                ) : (
                  <span className="text-muted-foreground">{humanize(segment)}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
