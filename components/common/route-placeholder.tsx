import type { Metadata } from "next";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";

interface RoutePlaceholderProps {
  title: string;
  description?: string;
}

export function createRouteMetadata(
  title: string,
  description?: string,
): Metadata {
  return {
    title: `${title} | PetroTrade ADMIN PANEL`,
    description: description ?? `${title} module for PetroTrade ADMIN PANEL`,
  };
}

export function RoutePlaceholder({
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
    </PageContainer>
  );
}
