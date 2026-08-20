import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  creditPoliciesMock,
  financeSummaryMock,
  paymentsMock,
  receivablesMock,
} from "@/mock/finance";
import { buildPaymentTrack } from "@/lib/utils/payment-track";
import type {
  CreditInsurancePolicy,
  PaymentRecord,
  PaymentStatus,
  ReceivableRecord,
} from "@/types/finance";

interface FinanceState {
  payments: PaymentRecord[];
  receivables: ReceivableRecord[];
  policies: CreditInsurancePolicy[];
  markPayment: (id: string, status: PaymentStatus) => void;
}

export const useFinanceStore = create<FinanceState>()(
  devtools(
    (set) => ({
      payments: paymentsMock,
      receivables: receivablesMock,
      policies: creditPoliciesMock,
      markPayment: (id, status) =>
        set((state) => ({
          payments: state.payments.map((item) => {
            if (item.id !== id) return item;
            const paidAt =
              status === "SETTLED"
                ? (item.paidAt ?? new Date().toISOString().slice(0, 10))
                : item.paidAt;
            return {
              ...item,
              status,
              paidAt,
              track: buildPaymentTrack(item.mode, status, item.dueDate, paidAt),
            };
          }),
        })),
    }),
    { name: "finance-store" },
  ),
);

export { financeSummaryMock };
