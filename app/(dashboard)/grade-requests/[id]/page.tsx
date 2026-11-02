import { createRouteMetadata } from "@/components/common";
import { GradeRequestDetail } from "@/components/grade-requests/grade-request-detail";

export const metadata = createRouteMetadata("Grade Request");

export default async function GradeRequestRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GradeRequestDetail id={id} />;
}
