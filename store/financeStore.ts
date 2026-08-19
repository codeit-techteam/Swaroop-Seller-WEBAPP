import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  creditPoliciesMock,
  financeSummaryMock,
  paymentsMock,
  receivablesMock,
} from "@/mock/finance";
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
          payments: state.payments.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })),
    }),
    { name: "finance-store" },
  ),
);

export { financeSummaryMock };
