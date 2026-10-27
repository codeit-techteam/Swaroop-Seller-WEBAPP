import type { ImportParty, ImportSide } from "@/types/import";

/**
 * Seller Web trades the SELL side of Import: it publishes SELL offers and
 * browses BUY requests (RFQs). The backend enforces the same rule from the session.
 */
export const IMPORT_OWN_SIDE: ImportSide = "SELL";
export const IMPORT_MARKET_SIDE: ImportSide = "BUY";
export const IMPORT_OWN_PARTY: ImportParty = "SELLER";

export const IMPORT_COPY = {
  own: "Sell offer",
  ownPlural: "Sell offers",
  ownLong: "Import sell offer",
  market: "Buy request",
  marketPlural: "Buy requests",
  price: "Offer price",
  quantity: "Available quantity",
  counterparty: "Buyer",
} as const;

export const IMPORT_ROUTES = {
  root: "/import",
  mine: "/import/sell",
  create: "/import/sell/new",
  mineDetail: (id: string) => `/import/sell/${id}`,
  edit: (id: string) => `/import/sell/${id}/edit`,
  market: "/import/requests",
  marketDetail: (id: string) => `/import/requests/${id}`,
  negotiations: "/import/negotiations",
  negotiationDetail: (id: string) => `/import/negotiations/${id}`,
  deals: "/import/deals",
  dealDetail: (id: string) => `/import/deals/${id}`,
  shipments: "/import/shipments",
} as const;

/** API path segment for a listing side. */
export const sidePath = (side: ImportSide) =>
  side === "BUY" ? "/import/buy" : "/import/sell";

/** Link to a listing of either side as seen from this app. */
export function listingHref(side: ImportSide, id: string): string {
  return side === IMPORT_OWN_SIDE
    ? IMPORT_ROUTES.mineDetail(id)
    : IMPORT_ROUTES.marketDetail(id);
}

/**
 * Empty-state copy for the Import market list (I-07).
 * Buy-request market must say "requests", never generic "listings".
 */
export function importMarketEmptyCopy(
  marketSide: ImportSide = IMPORT_MARKET_SIDE,
): {
  title: string;
  message: string;
} {
  if (marketSide === "BUY") {
    return {
      title: "No open buy requests",
      message:
        "No open buy requests — new requests appear here when they are published.",
    };
  }
  return {
    title: "No open sell offers",
    message:
      "No open sell offers — new offers appear here when sellers publish them.",
  };
}

export const IMPORT_MARKET_EMPTY_FILTERED =
  "No buy requests or sell offers match these filters. Try widening them.";
