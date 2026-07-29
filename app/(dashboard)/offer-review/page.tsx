import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

export default function OfferReviewRedirectPage() {
  redirect(ROUTES.OFFER_REVIEW_STATUS);
}
