import { createRouteMetadata } from "@/components/common";
import { GradeRequestsList } from "@/components/grade-requests/grade-requests-list";

export const metadata = createRouteMetadata(
  "Grade Requests",
  "Track grades you asked PolyStoreX to add",
);

export default function GradeRequestsPage() {
  return <GradeRequestsList />;
}
