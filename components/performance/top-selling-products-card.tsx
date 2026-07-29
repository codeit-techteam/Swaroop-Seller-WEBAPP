"use client";

import { motion } from "framer-motion";

import { EmptyState } from "@/components/common/empty-state";
import { Progress } from "@/components/ui/progress";
import type { TopProduct } from "@/types/performance";

interface TopSellingProductsCardProps {
  products: TopProduct[];
}

export function TopSellingProductsCard({
  products,
}: TopSellingProductsCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Top Selling Products
        </h2>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products"
          description="No sales data available for this period."
          className="border-0 bg-transparent py-10"
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="px-4 py-3 transition-colors hover:bg-slate-50/60"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg font-bold text-slate-300">
                  {String(product.rank).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {product.product}
                      </p>
                      <p className="text-xs text-slate-400">{product.grade}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-[#1B6EF3]">
                      {product.soldQuantity.toLocaleString("en-IN")}{" "}
                      {product.unit}
                    </p>
                  </div>
                  <Progress
                    value={product.progress}
                    className="mt-2 h-1.5 bg-slate-100"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
