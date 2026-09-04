import { createRouteMetadata } from "@/components/common";
import { AddGradeView } from "@/modules/grades/add-grade-view";

export const metadata = createRouteMetadata(
  "Add Grade",
  "Add a polymer grade without product images",
);

export default function NewProductPage() {
  return <AddGradeView />;
}
