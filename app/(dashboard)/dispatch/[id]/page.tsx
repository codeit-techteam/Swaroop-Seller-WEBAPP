"use client";

import { use } from "react";

import { DispatchOperationsView } from "@/modules/dispatch";

export default function DispatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <DispatchOperationsView initialDispatchId={id} />;
}
