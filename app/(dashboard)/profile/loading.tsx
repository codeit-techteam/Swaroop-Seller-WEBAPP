import { PageContainer } from "@/components/common/page-container";
import { ProfileLoadingSkeleton } from "@/components/profile";

export default function ProfileLoading() {
  return (
    <PageContainer>
      <ProfileLoadingSkeleton />
    </PageContainer>
  );
}
