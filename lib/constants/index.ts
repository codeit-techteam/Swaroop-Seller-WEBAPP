export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "PetroTrade Seller";

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
  PURCHASE_REQUESTS: "/purchase-requests",
  ORDERS: "/orders",
  ORDER_DETAIL: "/orders",
  DISPATCH: "/dispatch",
  VEHICLE_SLOT_BOOKING: "/dispatch/vehicle-slot-booking",
  SHIPMENTS: "/shipments",
  SHIPMENT_TRACKING: "/shipment-tracking",
  SETTLEMENTS: "/settlements",
  COMPLIANCE: "/compliance",
  COMPLIANCE_DETAIL: "/compliance",
  PRICE_REVISIONS: "/price-revision",
  OFFER_REVIEW: "/offer-review",
  OFFER_REVIEW_STATUS: "/offer-review-status",
  ANALYTICS: "/analytics",
  PERFORMANCE_DASHBOARD: "/performance-dashboard",
  NOTIFICATIONS: "/notifications",
  DOCUMENT_CENTER: "/document-center",
  DOCUMENTS: "/document-center",
  PROFILE: "/profile",
  SEARCH: "/search",
  LOGOUT: "/login",
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
  SETTLEMENTS: "settlements",
  ANALYTICS: "analytics",
  NOTIFICATIONS: "notifications",
  DOCUMENTS: "documents",
  COMPLIANCE: "compliance",
  PROFILE: "profile",
  SEARCH: "search",
} as const;
