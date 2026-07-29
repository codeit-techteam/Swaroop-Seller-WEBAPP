export type StatusVariant =
  "default" | "success" | "warning" | "danger" | "info" | "muted";

export type SortDirection = "asc" | "desc";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface FilterState {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
}
