"use client";

import { use } from "react";

import { ComplianceView } from "@/modules/compliance";

export default function ComplianceDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
  return <ComplianceView initialDocumentId={documentId} />;
}
