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
    title: `${title} | PolyStoreX Seller`,
    description: description ?? `${title} for PolyStoreX Seller Portal`,
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
