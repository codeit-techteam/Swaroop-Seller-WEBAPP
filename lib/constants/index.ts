export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "PetroTrade ADMIN PANEL";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const IS_DEV = process.env.NODE_ENV === "development";

export const IS_PROD = process.env.NODE_ENV === "production";

export const DEFAULT_PAGE_SIZE = 10;

export const MAX_PAGE_SIZE = 100;

export const DEBOUNCE_MS = 300;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "petrotrade_auth_token",
  REFRESH_TOKEN: "petrotrade_refresh_token",
  USER_PREFERENCES: "petrotrade_user_preferences",
  THEME: "petrotrade_theme",
  ONBOARDING: "petrotrade-onboarding",
  CX_PUBLISHED: "petrotrade_cx_published",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  SELLER_LOGIN: "/seller/login",
  SELLER_OTP: "/seller/login/otp",
  ONBOARDING_COMPANY: "/seller/onboarding/company",
  ONBOARDING_DOCUMENTS: "/seller/onboarding/documents",
  ONBOARDING_GST_PAN: "/seller/onboarding/gst-pan",
  ONBOARDING_BANK: "/seller/onboarding/bank",
  ONBOARDING_LOCATION: "/seller/onboarding/location",
  ONBOARDING_REVIEW: "/seller/onboarding/review",
  ONBOARDING_SUBMITTED: "/seller/onboarding/submitted",
  DASHBOARD: "/dashboard",
  INVENTORY: "/inventory",
  INVENTORY_ADD_PRODUCT: "/inventory/add-product",
  PRODUCTS: "/products",
  OFFERS: "/offers",
  OFFERS_CREATE: "/offers/create",
  OFFERS_EDIT: "/offers/edit",
  OFFERS_PREVIEW: "/offers/preview",
  PROCUREMENT: "/procurement",
  PROCUREMENT_QUEUE: "/procurement/queue",
  PROCUREMENT_ORDERS: "/procurement/orders",
  PROCUREMENT_SELLER_COMPARISON: "/procurement/seller-comparison",
  PROCUREMENT_NEGOTIATION: "/procurement/negotiation",
  PROCUREMENT_PURCHASE_REQUESTS: "/procurement/purchase-requests",
  PROCUREMENT_APPROVAL: "/procurement/approval",
  PROCUREMENT_REPORTS: "/procurement/reports",
  PROCUREMENT_TRACKING: "/procurement/tracking",
  PROCUREMENT_DOCUMENTS: "/procurement/documents",
  PROCUREMENT_SELLERS_NEW: "/procurement/sellers/new",
  PURCHASE_REQUESTS: "/purchase-requests",
  ORDERS: "/orders",
  ORDER_MANAGEMENT: "/order-management",
  ORDER_DETAIL: "/orders",
  DISPATCH: "/dispatch",
  VEHICLE_SLOT_BOOKING: "/dispatch/vehicle-slot-booking",
  SHIPMENTS: "/shipments",
  SHIPMENT_TRACKING: "/shipment-tracking",
  PAYMENTS: "/payments",
  RECEIVABLES: "/receivables",
  CREDIT_INSURANCE: "/credit-insurance",
  KYC: "/kyc",
  PRICE_REVISIONS: "/price-revision",
  OFFER_REVIEW: "/offer-review",
  OFFER_REVIEW_STATUS: "/offer-review-status",
  ANALYTICS: "/analytics",
  REPORTS: "/reports",
  PERFORMANCE_DASHBOARD: "/performance-dashboard",
  NOTIFICATIONS: "/notifications",
  DOCUMENT_CENTER: "/document-center",
  DOCUMENTS: "/document-center",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  SEARCH: "/search",
  LOGOUT: "/login",
  CUSTOMERS: "/customers",
  CUSTOMER_DETAIL: "/customers",
  CUSTOMER_REQUESTS: "/customers/requests",
  CUSTOMER_ORDERS: "/customers/orders",
  CUSTOMER_SUPPORT: "/customers/support",
  CUSTOMER_NOTIFICATIONS: "/customers/notifications",
  MARKETPLACE_CATALOG: "/marketplace/catalog",
  MARKETPLACE_CATEGORIES: "/marketplace/categories",
  MARKETPLACE_PRICING: "/marketplace/pricing",
  MARKETPLACE_OFFERS: "/marketplace/offers",
  CMS_HOME: "/cms/home",
  CMS_BANNERS: "/cms/banners",
  CMS_MEDIA: "/cms/media",
  CMS_VIDEOS: "/cms/videos",
  CMS_PROMOTIONS: "/cms/promotions",
  AUDIT_LOGS: "/audit-logs",
} as const;

export const QUERY_KEYS = {
  DASHBOARD: "dashboard",
  INVENTORY: "inventory",
  PRODUCTS: "products",
  OFFERS: "offers",
  PURCHASE_REQUESTS: "purchase-requests",
  ORDERS: "orders",
  DISPATCH: "dispatch",
  SHIPMENTS: "shipments",
  ANALYTICS: "analytics",
  NOTIFICATIONS: "notifications",
  DOCUMENTS: "documents",
  PROFILE: "profile",
  SEARCH: "search",
  PROCUREMENT: "procurement",
  FINANCE: "finance",
  KYC: "kyc",
  CUSTOMERS: "customers",
  CATALOG: "catalog",
  CMS: "cms",
} as const;
