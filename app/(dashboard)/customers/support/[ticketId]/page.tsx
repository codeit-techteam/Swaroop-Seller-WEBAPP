import { createRouteMetadata } from "@/components/common";
import { TicketDetailView } from "@/modules/support";

export const metadata = createRouteMetadata(
  "Support ticket",
  "Ticket conversation",
);

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  return <TicketDetailView ticketId={ticketId} />;
}
