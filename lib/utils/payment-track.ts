import type {
  PaymentMode,
  PaymentStatus,
  PaymentTrackStep,
  PaymentTrackStepStatus,
} from "@/types/finance";

type TrackTemplate = {
  key: string;
  label: string;
  description: string;
};

const TRACK_BY_MODE: Record<PaymentMode, TrackTemplate[]> = {
  ADVANCE: [
    {
      key: "order_confirmed",
      label: "Order confirmed",
      description: "Buyer order locked against advance terms",
    },
    {
      key: "proof_uploaded",
      label: "Proof uploaded",
      description: "UTR / payment proof submitted by buyer",
    },
    {
      key: "finance_verify",
      label: "Finance verify",
      description: "Bank credit matched by finance team",
    },
    {
      key: "settled",
      label: "Settled",
      description: "Funds cleared and order released",
    },
  ],
  ON_LOADING: [
    {
      key: "order_confirmed",
      label: "Order confirmed",
      description: "Dispatch slot reserved for loading",
    },
    {
      key: "loading_started",
      label: "Loading started",
      description: "Material loading in progress at warehouse",
    },
    {
      key: "payment_due",
      label: "Payment due",
      description: "Buyer payment required before gate-out",
    },
    {
      key: "settled",
      label: "Settled",
      description: "Payment cleared and truck released",
    },
  ],
  ON_DELIVERY: [
    {
      key: "dispatched",
      label: "Dispatched",
      description: "Shipment left warehouse for buyer site",
    },
    {
      key: "arrived",
      label: "Arrived",
      description: "Vehicle reached delivery location",
    },
    {
      key: "payment_due",
      label: "Payment due",
      description: "COD / on-delivery settlement pending",
    },
    {
      key: "settled",
      label: "Settled",
      description: "Payment collected and POD closed",
    },
  ],
  CREDIT: [
    {
      key: "order_confirmed",
      label: "Order confirmed",
      description: "Credit limit allocated to this order",
    },
    {
      key: "credit_active",
      label: "Credit active",
      description: "Goods released under credit terms",
    },
    {
      key: "due_window",
      label: "Due window",
      description: "Invoice aging within agreed credit days",
    },
    {
      key: "settled",
      label: "Settled",
      description: "Credit invoice fully collected",
    },
  ],
};

function statusCursor(status: PaymentStatus): {
  index: number;
  failed?: boolean;
} {
  switch (status) {
    case "PENDING":
      return { index: 1 };
    case "PROCESSING":
      return { index: 2 };
    case "OVERDUE":
      return { index: 2 };
    case "FAILED":
      return { index: 2, failed: true };
    case "SETTLED":
      return { index: 4 };
    default:
      return { index: 0 };
  }
}

function stepStatus(
  stepIndex: number,
  cursor: number,
  failed?: boolean,
): PaymentTrackStepStatus {
  if (failed && stepIndex === cursor) return "failed";
  if (stepIndex < cursor) return "completed";
  if (stepIndex === cursor) return "current";
  return "upcoming";
}

/** Build a mode-aware payment track from lifecycle status. */
export function buildPaymentTrack(
  mode: PaymentMode,
  status: PaymentStatus,
  dueDate: string,
  paidAt?: string,
): PaymentTrackStep[] {
  const templates = TRACK_BY_MODE[mode];
  const { index: cursor, failed } = statusCursor(status);

  return templates.map((template, stepIndex) => {
    const state = stepStatus(stepIndex, cursor, failed);
    let at: string | undefined;

    if (state === "completed" || state === "current" || state === "failed") {
      if (template.key === "settled" && paidAt) at = paidAt;
      else if (template.key === "payment_due" || template.key === "due_window")
        at = dueDate;
      else if (stepIndex === 0) at = dueDate;
    }

    return {
      key: template.key,
      label: template.label,
      description: template.description,
      status: state,
      at,
    };
  });
}

export function getTrackProgress(track: PaymentTrackStep[]): {
  completed: number;
  total: number;
  currentLabel: string;
  percent: number;
} {
  const total = track.length;
  const completed = track.filter((s) => s.status === "completed").length;
  const current =
    track.find((s) => s.status === "current" || s.status === "failed") ??
    track[track.length - 1];
  const percent =
    total === 0
      ? 0
      : Math.round(
          ((completed +
            (current?.status === "current" || current?.status === "failed"
              ? 0.5
              : 0)) /
            total) *
            100,
        );

  return {
    completed,
    total,
    currentLabel: current?.label ?? "—",
    percent: Math.min(100, percent),
  };
}
