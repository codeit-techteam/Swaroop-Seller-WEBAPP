import { ProfileLoadingSkeleton } from "@/components/profile";
import { PageContainer } from "@/components/common/page-container";

export default function ProfileLoading() {
  return (
    <PageContainer>
      <ProfileLoadingSkeleton />
    </PageContainer>
  );
}
