"use client";

import { useEffect } from "react";

import {
  DateFilter,
  ExportDropdown,
  LowStockAlertCard,
  MonthlyPerformanceChart,
  OperationalMetricsTable,
  PerformanceLoadingSkeleton,
  PerformanceSummaryCards,
  ReportDownloadSection,
  RequestReportModal,
  RevenueSettlementChart,
  TopSellingProductsCard,
} from "@/components/performance";
import { usePerformanceStore } from "@/store/performanceStore";

export function PerformanceDashboardView() {
  const loading = usePerformanceStore((s) => s.loading);
  const filters = usePerformanceStore((s) => s.filters);
  const chartTab = usePerformanceStore((s) => s.chartTab);
  const chartType = usePerformanceStore((s) => s.chartType);
  const sortKey = usePerformanceStore((s) => s.sortKey);
  const sortDirection = usePerformanceStore((s) => s.sortDirection);
  const requestReportOpen = usePerformanceStore((s) => s.requestReportOpen);
  const inventoryAlerts = usePerformanceStore((s) => s.inventoryAlerts);
  const topProducts = usePerformanceStore((s) => s.topProducts);
  const reports = usePerformanceStore((s) => s.reports);

  const bootstrap = usePerformanceStore((s) => s.bootstrap);
  const setDatePreset = usePerformanceStore((s) => s.setDatePreset);
  const setCustomDateRange = usePerformanceStore((s) => s.setCustomDateRange);
  const setMetricSearch = usePerformanceStore((s) => s.setMetricSearch);
  const setMetricStatus = usePerformanceStore((s) => s.setMetricStatus);
  const setSort = usePerformanceStore((s) => s.setSort);
  const setChartTab = usePerformanceStore((s) => s.setChartTab);
  const setChartType = usePerformanceStore((s) => s.setChartType);
  const setRequestReportOpen = usePerformanceStore(
    (s) => s.setRequestReportOpen,
  );
  const downloadReport = usePerformanceStore((s) => s.downloadReport);
  const exportData = usePerformanceStore((s) => s.exportData);
  const submitReportRequest = usePerformanceStore((s) => s.submitReportRequest);
  const getAdjustedKpis = usePerformanceStore((s) => s.getAdjustedKpis);
  const getFilteredMetrics = usePerformanceStore((s) => s.getFilteredMetrics);
  const getFilteredChartData = usePerformanceStore(
    (s) => s.getFilteredChartData,
  );

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const kpis = getAdjustedKpis();
  const metrics = getFilteredMetrics();
  const chartData = getFilteredChartData();

  if (loading) {
    return <PerformanceLoadingSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations Performance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Operational oversight across marketplace, procurement and finance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateFilter
            preset={filters.preset}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onPresetChange={setDatePreset}
            onCustomRangeChange={setCustomDateRange}
          />
          <ExportDropdown onExport={exportData} />
        </div>
      </div>

      <PerformanceSummaryCards kpis={kpis} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <OperationalMetricsTable
            metrics={metrics}
            search={filters.metricSearch}
            statusFilter={filters.metricStatus}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSearchChange={setMetricSearch}
            onStatusChange={setMetricStatus}
            onSort={setSort}
          />

          <RevenueSettlementChart
            data={chartData}
            activeTab={chartTab}
            chartType={chartType}
            onTabChange={setChartTab}
            onChartTypeChange={setChartType}
          />

          <MonthlyPerformanceChart data={chartData} />
        </div>

        <div className="space-y-4">
          <LowStockAlertCard alerts={inventoryAlerts} />
          <TopSellingProductsCard products={topProducts} />
        </div>
      </div>

      <ReportDownloadSection
        reports={reports}
        onDownload={downloadReport}
        onRequestCustom={() => setRequestReportOpen(true)}
      />

      <RequestReportModal
        open={requestReportOpen}
        onOpenChange={setRequestReportOpen}
        onSubmit={submitReportRequest}
        defaultDateFrom={filters.dateFrom}
        defaultDateTo={filters.dateTo}
      />
    </div>
  );
}
